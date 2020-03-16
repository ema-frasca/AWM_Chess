import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'
import { useNavigationState } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import GamePage from "./Game";


const Stack = createStackNavigator();

function HomeRouter(props) {
  // console.log(JSON.stringify(props));
  //console.log(JSON.stringify(props.navigation))
  let id = null;
  if (props.route.params != undefined && props.route.params.id ) {
    console.log('id '+ props.route.params.id)
  }
  //const reset = () => { if (props.route.params != undefined) props.route.params.screen = "Home";}
  return (
    <Stack.Navigator initialRouteName="Home" headerMode="none">
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Game" component={GamePage} initialParams={{resetScreen: 0}} />
    </Stack.Navigator>
  );
}

function HomePage(props) {
  //console.log('render home '+JSON.stringify(props));
  return (
      <View>
          <MyText>I'm the Home</MyText>
          <MyButton onPress={() => props.navigation.navigate('Game', {id: 2})} >Go game</MyButton>
          <MyButton onPress={global.logout} >Logout</MyButton>
      </View>
  );
}

export default HomeRouter;