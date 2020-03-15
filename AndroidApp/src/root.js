import React from 'react'
import { View, Text, ImageBackground, AsyncStorage, Button  } from 'react-native'
import { imgs, LoadingPage, addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, sizeDict } from './styles'
import LoginRouter from './login'

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeRouter from "./Home";
import LobbyPage from "./Lobby";
import AccountPage from "./Account";


class Root extends React.Component {
    constructor(props) {
        super(props);

        this.loginToken = {type: "login-token", f: this.loginSuccess, reqId: null};

        this.state = {
            loading : true,
            token : null,
            authenticated : false,
        };
    }

    getToken = () => {
        AsyncStorage.getItem('token', (err, result) => {
            this.setState({token: result})
            this.tryTokenLogin();
        });
    }

    firstLogin = (token) => {
        AsyncStorage.setItem('token', token);
        this.setState({token: token})
    }

    logout = () => {
        global.wsSend({type: "logout"});
        AsyncStorage.removeItem('token');
        this.setState({token: null, authenticated: false});
    }

    componentDidMount() {
        this.loginToken.reqId = addWsListener(this.loginToken);
        global.wsOnStateChange.push(this.wsChange);
        this.getToken();
        global.logout = this.logout;
    }

    componentWillUnmount() {
        removeWsListener(this.loginToken.reqId);
        global.wsOnStateChange.pop();
    }

    loginSuccess = (content) => {
        let auth = false;
        if ("token" in content) {
            if (content.token !== this.state.token)
                this.firstLogin(content.token);
            auth = true;
        }

        this.setState({loading: false, authenticated: auth})
    }

    tryTokenLogin = () => {
        if (this.state.token) {
            global.wsSend({"type": "login-token", "token": this.state.token})
        } else
            this.setState({loading: false})
    }

    wsChange = () => {
        if (global.ws)
            this.tryTokenLogin()
        else
            this.setState({loading: true, authenticated: false})
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />
        return (
            <FadeInView style={{flex: 1}}>
                <ChessHeader />
                {this.state.authenticated ? <Router /> : <LoginRouter />}
            </FadeInView>
        );
    }
}

function ChessHeader(props) {
    return (
        <View style={{height: '15%'}}>
            <ImageBackground source={imgs.headerImage} style={styles.header.image}>
                <Text style={styles.header.text}>AWM-CHESS</Text>
            </ImageBackground>
        </View>
    );
}


const Tab = createBottomTabNavigator();

function Router(props) {
    const options={
        activeBackgroundColor: 'rgb(255, 249, 199)',
        activeTintColor: 'black',
        showIcon: false,
        labelStyle: {
            fontSize: sizeDict[5],
            fontFamily: 'comic-sans-bold',
        },
        tabStyle: {
            borderColor: 'grey',
            borderRightWidth: 1,
            justifyContent: 'center',

        },
        keyboardHidesTabBar: true,
    };
    const MyLabel = (title) => (props) => {
        return <MyText size={5} bold color={props.color} style={{textAlign: 'center', lineHeight: sizeDict[4]}} >{title}</MyText>;
    }
    return (
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Home" screenOptions={{unmountOnBlur: true}} tabBarOptions={options}>
            <Tab.Screen name="Home" component={HomeRouter} />
            <Tab.Screen name="Quick" component={LobbyPage} initialParams={{ type: "quick" }} options={{tabBarLabel: MyLabel('Quick Game')}} />
            <Tab.Screen name="Slow" component={LobbyPage} initialParams={{ type: "slow" }} options={{tabBarLabel: MyLabel('Slow Game')}} />
            <Tab.Screen name="Account" component={AccountPage} />
          </Tab.Navigator>
        </NavigationContainer>
    );
}

export default Root