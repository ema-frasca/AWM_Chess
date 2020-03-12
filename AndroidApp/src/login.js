import React from 'react'
import { View, Text, AsyncStorage  } from 'react-native'
import { imgs, LoadingPage } from './utils'
import styles from './styles'
import * as Google from 'expo-google-app-auth'

const ANDROID_CLIENT_ID = "130753714497-0qvqmt1ttieljn4uc5crakpdur66ptop.apps.googleusercontent.com"

class LoginPage extends React.Component {

    render() {
        return (
            <View>
                <button title={'Login with Google'} onClick={this.googleLogin}></button>
            </View>
        );
    }
}

googleLogin = async() => {
    try {
        const result = await Google.logInAsync({
            androidClientId: ANDROID_CLIENT_ID,
            scopes: ["profile", "email"]
        })

        if (result.type === "success"){
            console.log('\nuser:' + result.user.id + '  ' + result.user.givenName);
            console.log('\ntoken:' + result.accessToken)
        }
    } catch (e) {
        console.log("error", e)
      }
}

export default LoginPage;

/*
signIn = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId: androidClientId,
        scopes: ["profile", "email"]
      })
      if (result.type === "success") {
        this.setState({
          signedIn: true,
          name: result.user.name,
          photoUrl: result.user.photoUrl
        })
      } else {
        console.log("cancelled")
      }
} catch (e) {
      console.log("error", e)
    }
}
*/


