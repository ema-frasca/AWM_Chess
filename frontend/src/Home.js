import React from "react";
import { Link } from "react-router-dom";
import { LoadingPage, addWsListener, removeWsListener, TimerDisplay } from "./utils";


// Home shows your ongoing matches and a short match history (last 5 games)
class HomePage extends React.Component {
    constructor(props) {
        super(props);

        // ws message: {type: "notify", (id: NUMBER)}
        this.notificationListener = {type: "notify", f: this.onNotification, notId: null};
        // ws message: {type: "home-page", list: [obj], usename: STRING, history: [obj]}
        //  list obj: {id: NUMBER, vs: {username: STRING, category: STRING}, time: NUMBER, turn: BOOL}
        //  history obj: {id: NUMBER, vs: STRING, result: STRING}
        this.homeRequest = {type: "home-page", f: this.getHome, reqId: null};

        this.state = {
            list: null,
            user: null,
            history: null,
            loading: true
        };
    }

    componentDidMount() {
        this.homeRequest.reqId = addWsListener(this.homeRequest);
        this.notificationListener.notId = addWsListener(this.notificationListener);
        this.requestPage();
    }

    requestPage = () => {
        global.wsSend({type: this.homeRequest.type});
    }

    getHome = (content) => {
        this.setState({list: content.list, history: content.history, user: content.username, loading: false});
    }

    onNotification = (content) => {
        this.requestPage();
    }
    
    componentWillUnmount() {
        removeWsListener(this.homeRequest.reqId);
        removeWsListener(this.notificationListener.notId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        return (
            <div>
                <h1>Welcome {this.state.user}</h1>
                {this.state.list.map((match, i) => (
                    <div key={i}><ShowMatchLink {...match} ended={false} /></div>
                ))}
                <hr />
                <h2>History</h2>
                {this.state.history.map((match, i) => (
                    <div key={i}><ShowMatchLink {...match} ended={true} /></div>
                ))}
            </div>
        );
    }
}

function ShowMatchLink(props){
    return(
        <Link to={"/game/" + props.id} className="lobby-link">
            {props.ended ? <EndedMatchLine {...props} /> : <InMatchLine {...props} />}
        </Link>
    );
}

function InMatchLine(props){
    return(
        <div className="lobby-box">
            <p>vs <span>{props.vs.username}</span><span>({props.vs.category})</span>
            {props.turn ? <b>Your turn</b> : null}<TimerDisplay time={props.time} updateTime={(new Date()).getTime()} /></p>
        </div>
    );
}

function EndedMatchLine(props){
    return(
        <div className="lobby-box">
            <p>vs <span>{props.vs}</span><span>{props.result}</span></p>
        </div>
    );
}

export default HomePage;