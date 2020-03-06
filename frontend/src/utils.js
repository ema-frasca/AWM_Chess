import React from "react";

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

    render () {
        let divClass = this.state.loading ? "loading-socket" : "hidden";

        return (
            <div className={divClass}>
                <img className="loading-icon" src={global.imgs + "loading.png"} alt="loading"/>
            </div>
        );
    }
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

function PieceImg(props) {
    let className = "chess-piece ";
    if (props.className)
        className += props.className;
    const src = global.sprites + piecesDict[props.piece] + ".png"
    return <img className={className} alt={props.piece} src={src} ></img>;
}

function LoadingPage(props) {
    return (
        <div className={props.loading ? "loading-page" : "hidden"}>
            <img className="loading-icon" src={global.imgs + "loading.png"} alt="loading"/>
        </div>
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

export { LoadingScreen, LoadingPage, addWsListener, removeWsListener, PieceImg, displayTime, TimerDisplay };