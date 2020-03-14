import React from 'react'
import { View, TouchableHighlight, Image, Keyboard } from 'react-native'
import { imgs, addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyTextInput, MyButton, MyAuthLinks } from './styles'
import { logInAsync } from 'expo-google-app-auth'
import { openBrowserAsync } from "expo-web-browser"
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"


const Stack = createStackNavigator();

function LoginRouter(props) {
    const options = styles.login.routerOptions
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={options} >
            <Stack.Screen name="Login" component={LoginPage} options={{ title: 'Login to start playing' }} />
            <Stack.Screen name="Create" component={SignupPage} options={{ title: 'Create User' }} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}

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
                <LoginForm />
                <TouchableHighlight style={{width: '80%'}} activeOpacity={0.6} underlayColor="white" onPress={this.googleLogin}>
                    <Image style={styles.login.google} source={imgs.googleLogin}/>
                </TouchableHighlight>
                <AuthButtons navigation={this.props.navigation} />
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

function AuthButtons(props) {
    buttonLink = async () => await openBrowserAsync('http://' + global.host + '/account/password_reset/');
    return(
        <View>
            <MyAuthLinks onPress={() => props.navigation.navigate('Create')}>Create account</MyAuthLinks>
            <MyAuthLinks onPress={buttonLink}>Lost password?</MyAuthLinks>
        </View>
    );
}

class SignupPage extends React.Component {

    render(){
        return(
            <MyText>Cazzo</MyText>
        );
    }
}

export default LoginRouter;

