import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'


function LobbyPage(props) {
    return (
        <View>
            <MyText>I'm the lobby of {props.route.params.type} games</MyText>
        </View>
    );
}

export default LobbyPage;