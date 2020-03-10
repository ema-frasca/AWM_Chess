import React, { useEffect } from "react";
import { Text, Image, View, Animated } from 'react-native';

import styles from './styles'


const imgs = {
    loadingIcon: require('../assets/imgs/loading.png'),
    headerImage: require('../assets/imgs/chessbg.bmp'),
}

const sprites = {

}

const piecesDict = {
    empty: "empty",
    k: "black_king",
    q: "black_queen",
    b: "black_bishop",
    n: "black_knight",
    r: "black_rook",
    p: "black_pawn",
    K: "white_king",
    Q: "white_queen",
    B: "white_bishop",
    N: "white_knight",
    R: "white_rook",
    P: "white_pawn",
}

class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        this.wsChange();
        global.wsOnStateChange.push(this.wsChange);
    }

    wsChange = () => {
        if (global.ws)
            this.setState({loading: false})
        else
            this.setState({loading: true})
    }

    componentWillUnmount() {
        global.wsOnStateChange.pop();
    }

    render () {
        if (this.state.loading)
            return (
                <View style={styles.loadingSocket}>
                    <LoadingImage />
                    <Text>Loading...</Text>
                </View>
            );
        else
                return <></>;
    }
}

function LoadingImage(props) {
    let rotationValue = new Animated.Value(0);
    const rotation = rotationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"]
      });
    let transformStyle = { transform: [{ rotate: rotation }] };

    Animated.loop(
        Animated.timing(rotationValue, {toValue: 1, duration: 2000})
    ).start();
 
    return <Animated.Image source={imgs.loadingIcon} style={[styles.loadingImage, transformStyle]} />;
}

function LoadingPage(props) {
    return (
        <View style={styles.loadingPage}>
            <LoadingImage />
            <Text>Loading...</Text>
        </View>
    );
}

function PieceImg(props) {
    let className = "chess-piece ";
    if (props.className)
        className += props.className;
    const src = global.sprites + piecesDict[props.piece] + ".png"
    return <img className={className} alt={props.piece} src={src} ></img>;
}

function addWsListener(obj) {
    for (var i=0; global.wsOnMessage.has(i); i++);
    global.wsOnMessage.set(i, obj);
    return i;
}

function removeWsListener(id) {
    global.wsOnMessage.delete(id)
}

function displayTime(minutes) {
    return (parseInt(minutes/60)).toString().padStart(2, "0") + ":" +(minutes%60).toString().padStart(2, "0")
}

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
        return <span>{displayTime(time)}</span>;
    }
}

export { 
    LoadingScreen, LoadingPage, addWsListener, removeWsListener, 
    PieceImg, displayTime, TimerDisplay, imgs, sprites
 };