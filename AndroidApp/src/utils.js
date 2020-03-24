import React from "react";
import { Text, Image, View, Animated, Button, AsyncStorage } from 'react-native';

import styles, { MyText, MyTextInput, InlineView } from './styles'


const imgs = {
    loadingIcon: require('../assets/imgs/loading.png'),
    headerImage: require('../assets/imgs/chessbg.bmp'),
    googleLogin: require('../assets/imgs/btn_google_signin.png'),
    googleAccount: require('../assets/imgs/google_account.png'),
}

function MyImage(props){
    let style = { resizeMode: 'contain' };
    if ("width" in props) {
      style.width = props.width;
      if (! ("noHeight" in props))
          style.height = "height" in props ? props.height : props.width;
    }
    return <Image {...props} source={imgs[props.name]} style={[style, props.style]} />
  }

// dict to connect the letter representing the piece and their image
const piecesDict = {
    empty: require("../assets/sprites/empty.png"),
    k: require("../assets/sprites/black_king.png"),
    q: require("../assets/sprites/black_queen.png"),
    b: require("../assets/sprites/black_bishop.png"),
    n: require("../assets/sprites/black_knight.png"),
    r: require("../assets/sprites/black_rook.png"),
    p: require("../assets/sprites/black_pawn.png"),
    K: require("../assets/sprites/white_king.png"),
    Q: require("../assets/sprites/white_queen.png"),
    B: require("../assets/sprites/white_bishop.png"),
    N: require("../assets/sprites/white_knight.png"),
    R: require("../assets/sprites/white_rook.png"),
    P: require("../assets/sprites/white_pawn.png"),
}

// Image of a chess piece
function PieceImg(props) {
    const style = {
        height: '100%', width: undefined, 
        aspectRatio: 1, resizeMode: 'contain'
    };
    return <Image style={style} source={piecesDict[props.piece]} />;
}

// Loading screen waiting for WebSocket connection
class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            host: global.host,
        };

        this.style = {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            top: 0, bottom: 0, left: 0, right: 0,
            alignItems: 'center',
            justifyContent: 'center',
        };
        this.development = true;
    }

    componentDidMount() {
        this.wsChange();
        global.wsOnStateChange.push(this.wsChange);
    }

    wsChange = () => {
        if (global.ws){
            this.setState({loading: false});
            AsyncStorage.setItem('wsHost', global.host);
        } else
            this.setState({loading: true});
    }

    componentWillUnmount() {
        global.wsOnStateChange.pop();
    }

    render () {
        const hostStyle = {
            position: 'absolute',
            top: '5%',
            width: '95%'

        };
        if (this.state.loading)
            return (
                <View style={this.style}>
                    <LoadingImage />
                    <Text>Loading...</Text>
                    {this.development ? (
                        <InlineView style={hostStyle}>
                            <MyTextInput style={{width: '75%'}}
                                value={this.state.host}
                                onChangeText={(text) => this.setState({host: text})}
                            />
                            <Button title="connect" onPress={() => global.host = this.state.host} />
                        </InlineView>
                    ) : null}
                </View>
            );
        else
                return <></>;
    }
}

class LoadingImage extends React.Component {
    constructor(props){
        super(props);

        this.state = {rotationValue: new Animated.Value(0)}
        this.style = {
            width: '20%', height: '20%', minHeight: 80, minWidth: 80, 
            resizeMode: 'contain' 
        };
    }

    componentDidMount(){
        Animated.loop(
            Animated.timing(this.state.rotationValue, {toValue: 1, duration: 2000})
        ).start();    
    }

    render(){
        const rotation = this.state.rotationValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"]
          });
        let transformStyle = { transform: [{ rotate: rotation }] };
        return <Animated.Image source={imgs.loadingIcon} style={[this.style, transformStyle]} />;
    }
}

// page showed when loading data from server
function LoadingPage(props) {
    const style = {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <View style={style}>
            <LoadingImage />
            <Text>Loading...</Text>
        </View>
    );
}

function addWsListener(obj) {
    for (var i=0; global.wsOnMessage.has(i); i++);
    global.wsOnMessage.set(i, obj);
    return i;
}

function removeWsListener(id) {
    global.wsOnMessage.delete(id)
}

// from an int of minutes writes a string of time format h:m
function displayTime(minutes) {
    return (parseInt(minutes/60)).toString().padStart(2, "0") + ":" +(minutes%60).toString().padStart(2, "0")
}

// Automatic decreasing time string (using the format above), and never going negative
// if it reach zero it sends a ws request to check the times left for the moves (in order to automatically end some games)
class TimerDisplay extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            time : props.time,
        };

        this.timer = null;
    }

    componentDidMount() {
        this.timer = setInterval(this.tick, 60000);
    }

    componentDidUpdate(oldProps) {
        if (oldProps.updateTime !== this.props.updateTime)
            this.setState({time: this.props.time});
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        
    }

    tick = () => {
        const time = this.state.time - 1;
        this.setState({time: time});
    }

    render() {
        const time = Math.max(0, this.state.time)
        if (time === 0)
            global.wsSend({"type": "times-check"});
        return <MyText flex={1} center>{displayTime(time)}</MyText>;
    }
}

export { 
    LoadingScreen, LoadingPage, MyImage, addWsListener, removeWsListener, 
    PieceImg, displayTime, TimerDisplay, imgs
 };