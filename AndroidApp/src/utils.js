import React from "react";
import { Text, Image, View, Animated } from 'react-native';

import styles from './styles'


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
      if (! "noHeight" in props)
          style.height = "height" in props ? props.height : props.width;
    }
    return <Image {...props} source={imgs[props.name]} style={[style, props.style]} />
  }

const piecesDict = {
    empty: "empty.png",
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

function PieceImg(props) {
    // className = "chess-piece "-> dimensioni;
    const width = props.icon ? '15%' : '100%';
    return <Image style={{height: '100%', width: width, resizeMode: 'contain'}} source={piecesDict[props.piece]} />;
}

class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        this.style = {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            top: 0, bottom: 0, left: 0, right: 0,
            alignItems: 'center',
            justifyContent: 'center',
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
                <View style={this.style}>
                    <LoadingImage />
                    <Text>Loading...</Text>
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
    LoadingScreen, LoadingPage, MyImage, addWsListener, removeWsListener, 
    PieceImg, displayTime, TimerDisplay, imgs
 };