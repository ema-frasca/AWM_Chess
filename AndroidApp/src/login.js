import React from 'react'
import { View, Text, AsyncStorage, Button } from 'react-native'
import { imgs, LoadingPage } from './utils'
import styles from './styles'
import * as Google from 'expo-google-app-auth'

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"

class LoginPage extends React.Component {

  googleLogin = async() => {
    try {
        console.log('\nlogin with google');
        const result = await Google.logInAsync({
         androidClientId: ANDROID_CLIENT_ID,
         scopes: ["profile", "email"]
        });

      if (result.type === "success"){
          console.log('\nuser:' + result.user.id + '  ' + result.user.givenName);
          console.log('\ntoken:' + result.accessToken);
      }
    } catch (e) {
        console.log("error", e);
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

