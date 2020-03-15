import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'

import { createStackNavigator } from '@react-navigation/stack';
import GamePage from "./Game";


const Stack = createStackNavigator();

function HomeRouter(props) {
    return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Game" component={GamePage} />
      </Stack.Navigator>
    );
}

function HomePage(props) {
    return (
        <View>
            <MyText>I'm the Home</MyText>
            <MyButton onPress={() => props.navigation.navigate('Game', {id: 2})} >Go game</MyButton>
            <MyButton onPress={global.logout} >Logout</MyButton>
        </View>
    );
}

export default HomeRouter;