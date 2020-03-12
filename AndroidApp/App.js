import React from 'react';
import "./src/config"

import { View } from 'react-native';

import { FadeInView} from './src/styles'
import { LoadingScreen } from "./src/utils";
import Root from './src/root';
import { loadFont } from './src/styles'


export default function App() {
  loadFont();
  return (
    <View style={{flex: 1}}>
      <FadeInView>
        <Root />
      </FadeInView>
      <LoadingScreen />
    </View>
  );
}

