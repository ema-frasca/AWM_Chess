import React from 'react'
import { View, TouchableHighlight, Image, Keyboard } from 'react-native'
import { imgs, addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyTextInput, MyButton } from './styles'
import { logInAsync } from 'expo-google-app-auth'

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
    }

  googleLogin = async() => {
    const result = await logInAsync({androidClientId: ANDROID_CLIENT_ID});

    if (result.type === "success"){
        global.wsSend({"type": "login-social", "token": result.accessToken});
    }
  }

    render() {
        return (
            <FadeInView style={styles.login.view}>
                <MyText size={2} bold color="green" >Login to start playing</MyText>
                <LoginForm />
                <TouchableHighlight style={{width: '80%'}} activeOpacity={0.6} underlayColor="white" onPress={this.googleLogin}>
                    <Image style={styles.login.google} source={imgs.googleLogin}/>
                </TouchableHighlight>
            </FadeInView>
        );
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.authRequest = {type: "login-auth", f: this.authError, reqId: null};

        this.state = {
            username: "",
            password: "",
            error: null,
        };
    }

    authError = (content) => {
        Keyboard.dismiss();
        this.setState({username: "", password: "", error: content.error})
    }

    componentDidMount() {
        this.authRequest.reqId = addWsListener(this.authRequest);
    }

    componentWillUnmount() {
        removeWsListener(this.authRequest.reqId);
    }

    render (){
        return (
            <View style={{width: '60%', alignItems: 'center'}}>
                <MyText>Username</MyText>
                <MyTextInput 
                    value={this.state.username} 
                    onChangeText={(text) => this.setState({username: text})} 
                    autoCompleteType="username"
                />
                <MyText>Password</MyText>
                <MyTextInput 
                    value={this.state.password} 
                    onChangeText={(text) => this.setState({password: text})}
                    autoCompleteType="password"
                    secureTextEntry
                />
                <MyButton onPress={() => global.wsSend({type: "login-auth", ...this.state })} style={styles.login.button} >Login</MyButton>
                {this.state.error ? <MyText color="red">{this.state.error}</MyText> : null }
            </View>
        );
    }
}

export default LoginPage;

