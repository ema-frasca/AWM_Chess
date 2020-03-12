import React from 'react'
import { View, TouchableHighlight, Image } from 'react-native'
import { imgs } from './utils'
import styles, { FadeInView, MyText, MyTextInput } from './styles'
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
                <MyText size={2} bold style={{color: "green"}} >Login to start playing</MyText>
                <LoginForm />
                <TouchableHighlight style={{width: '80%'}} onPress={this.googleLogin}>
                    <Image style={styles.login.google} source={imgs.googleLogin}/>
                </TouchableHighlight>
            </FadeInView>
        );
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
        };
    }

    render (){
        return (
            <View style={{width: '60%', alignItems: 'center'}}>
                <MyText>Username</MyText>
                <MyTextInput 
                    value={this.state.username} 
                    onChangeText={(text) => this.setState({username: text})} 
                />
                <MyText>Password</MyText>
                <MyTextInput 
                    value={this.state.password} 
                    onChangeText={(text) => this.setState({password: text})}
                    secureTextEntry
                />
            </View>
        );
    }
}

export default LoginPage;

