import React from 'react'
import { View, Text, ImageBackground, AsyncStorage, Button  } from 'react-native'
import { imgs, LoadingPage, addWsListener, removeWsListener } from './utils'
import styles, { FadeInView } from './styles'
import LoginPage from './login'

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
        AsyncStorage.removeItem('token');
        this.setState({token: null, authenticated: false});
    }

    componentDidMount() {
        this.loginToken.reqId = addWsListener(this.loginToken);
        global.wsOnStateChange.push(this.wsChange);
        this.getToken();
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
                {this.state.authenticated ? <Router logout={this.logout} /> : <LoginPage />}
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

function Router(props) {
    return (
        <View>
            <Text>Sei loggato ;)</Text>
            <Button title="Logout" onPress={props.logout} />
        </View>
    );
}

export default Root