import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'


function GamePage(props) {
    return (
        <View>
            <MyText>I'm the game {props.route.params.id}</MyText>
        </View>
    );
}

export default GamePage;