import React from 'react'
import { View, Text, ImageBackground, AsyncStorage  } from 'react-native'
import { imgs, LoadingPage } from './utils'
import styles from './styles'

class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading : true,
            token : null,
            authenticated : false,
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('TOKEN', (err, result) => {
            console.log("result: "+ result);
            console.log("error: "+ JSON.stringify(err));
        });
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />
        return (
            <View style={{flex: 1}}>
                <ChessHeader />
                <Stack.Navigator>
                    {this.state.authenticated  ? (
                        <Stack.Screen name="Home" component={<Text>Yeeee</Text>} />
                    ) : (
                        // No token found, user isn't signed in
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{
                            title: 'Sign in',
                            }}
                        />
                    )}
                </Stack.Navigator>
            </View>
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

export default Root