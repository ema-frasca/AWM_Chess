import React from "react";
import { Link } from "react-router-dom";
import { LoadingPage, addWsListener, removeWsListener, displayTime } from "./utils";

class HomePage extends React.Component {
    constructor(props) {
        super(props);

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
        global.wsSend({type: this.homeRequest.type});
    }

    getHome = (content) => {
        this.setState({list: content.list, history: content.history, user: content.username, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.homeRequest.reqId);
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
            <p>vs <span>{props.vs.username}</span><span>({props.vs.category})</span>{props.turn ? <b>Your turn</b> : null}<span>{displayTime(props.time)}</span></p>
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