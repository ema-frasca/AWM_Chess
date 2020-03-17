import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'
import { useNavigationState } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import GamePage from "./Game";


const Stack = createStackNavigator();

function HomePage(props) {
  //console.log('render home '+JSON.stringify(props));
  return (
      <View>
          <MyText>I'm the Home</MyText>
          <MyButton onPress={() => props.navigation.jumpTo('Game', {id: 2})} >Go game</MyButton>
          <MyButton onPress={global.logout} >Logout</MyButton>
      </View>
  );
}

export default HomePage;