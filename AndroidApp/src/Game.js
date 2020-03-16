import React from 'react'
import { View } from 'react-native'
import { addWsListener, removeWsListener } from './utils'
import styles, { FadeInView, MyText, MyButton } from './styles'


class GamePage extends React.Component {

    componentDidMount(){
        //this.props.route.params.resetScreen();
        this._unsubscribe = this.props.navigation.addListener('tabPress', (e) => {
            // do something
            console.log(JSON.stringify(e));
          });
    }

    componentWillUnmount() {
        this._unsubscribe();
      }

    render(){
        return (
            <View>
                <MyText>I'm the game {this.props.route.params.id}</MyText>
            </View>
        );
    }
}

export default GamePage;