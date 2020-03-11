import React from 'react'
import { View, Text, ImageBackground, AsyncStorage  } from 'react-native'
import { imgs, LoadingPage } from './utils'
import styles, { FadeInView } from './styles'
import LoginPage from './login'

class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            token : null,
            authenticated : false,
        };
    }

    getToken = () => {
        AsyncStorage.getItem('TOKEN', (err, result) => {
            console.log("result: "+ result);
            this.setState({token: result})
        });
    }

    firstLogin = (token) => {
        // login message already send
        AsyncStorage.setItem('token', token);
        this.setState({token: token, authenticated: true})
    }

    logout = () => {
        AsyncStorage.removeItem('token');
        this.setState({token: null, authenticated: false});
    }

    componentDidMount() {
        this.getToken();
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />
        return (
            <FadeInView style={{flex: 1}}>
                <ChessHeader />
                {this.state.authenticated ? <Router /> : <LoginPage />}
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
    return <Text>Sei loggato ;)</Text>
}

export default Root