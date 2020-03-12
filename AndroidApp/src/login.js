import React from 'react'
import { View, Text, AsyncStorage, Button } from 'react-native'
import { imgs } from './utils'
import styles from './styles'
import { logInAsync } from 'expo-google-app-auth'

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"

class LoginPage extends React.Component {

  googleLogin = async() => {
    const result = await logInAsync({androidClientId: ANDROID_CLIENT_ID});

    if (result.type === "success"){
        global.wsSend({"type": "login-social", "token": result.accessToken});
    }
  }

    render() {
        return (
            <View>
                <Button title={'Login with Google'} onPress={this.googleLogin} />
            </View>
        );
    }
}

export default LoginPage;

