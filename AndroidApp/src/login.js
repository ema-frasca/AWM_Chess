import React from 'react'
import { View, TouchableHighlight, Keyboard, KeyboardAvoidingView } from 'react-native'
import { addWsListener, removeWsListener, MyImage } from './utils'
import styles, { FadeInView, MyText, MyTextInput, MyButton, MyAuthLinks } from './styles'
import { logInAsync } from 'expo-google-app-auth'
import { openBrowserAsync } from "expo-web-browser"
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RFPercentage } from "react-native-responsive-fontsize";

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"


const Stack = createStackNavigator();

function LoginRouter(props) {
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={styles.login.routerOptions} >
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
                    <MyImage width="100%" noHeight name="googleLogin"/>
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
            <View style={styles.login.form}>
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
    constructor(props){
        super(props);
        
        this.signupRequest = {type: "login-signup", f: this.signupError, reqId: null};

        this.state = {
            username: "",
            password1: "",
            password2: "",
            error: null,
            avoidKeyboard: false,
        };
    }

    signupError = (content) => {
        this.setState({password1: "", password2: "", error: content.error})
    }

    componentDidMount() {
        this.signupRequest.reqId = addWsListener(this.signupRequest);
    }

    componentWillUnmount() {
        removeWsListener(this.signupRequest.reqId);
    }

    submit = () => {
        Keyboard.dismiss();
        for (const field in this.state)
            if (field !== "error" && field !== "avoidKeyboard" && this.state[field] === "")
                return this.setState({error: field + " cannot be empty"})
        global.wsSend({type: "login-signup", ...this.state })
    }

    render(){
        return(
            <FadeInView style={styles.login.view}>
                <KeyboardAvoidingView style={{width: '70%'}} keyboardVerticalOffset={RFPercentage(25)} 
                    behavior="position" enabled={this.state.avoidKeyboard} >
                    <View style={{alignItems: 'center'}}>
                        <MyText>Username</MyText>
                        <MyTextInput 
                            value={this.state.username} 
                            onChangeText={(text) => this.setState({username: text})}
                        />
                        <MyText>Password</MyText>
                        <MyTextInput 
                            value={this.state.password1} 
                            onChangeText={(text) => this.setState({password1: text})}
                            secureTextEntry
                        />
                        <MyText>Confirm Password</MyText>
                        <MyTextInput 
                            value={this.state.password2} 
                            onChangeText={(text) => this.setState({password2: text})}
                            onFocus={() => this.setState({avoidKeyboard: true})}
                            onBlur={() => this.setState({avoidKeyboard: false})}
                            secureTextEntry
                        />
                        <MyButton style={styles.login.button} onPress={this.submit}>Sign up</MyButton>
                    </View>
                </KeyboardAvoidingView>
            {this.state.error ? <MyText center color="red">{this.state.error}</MyText> : null }
            </FadeInView>
        );
    }
}

export default LoginRouter;

