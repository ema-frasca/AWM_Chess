import React from "react";
import { LoadingPage } from "./utils"


class LobbyPage extends React.Component {
    constructor(props) {
        super(props);

        this.userMatchesLeft = {type: "matches-left", f: this.getLeftMatches, reqId: null};

        this.state = {
            leftMatches: null,
            loading: true
        };
    }

    componentDidMount() {
        this.userMatchesLeft.reqId = global.wsOnMessage.push(this.userMatchesLeft) - 1;
        global.wsSend({type: this.userMatchesLeft.type, quick: this.props.quick});
    }

    getLeftMatches = (content) => {
        if (content.quick === this.props.quick)
            this.setState({leftMatches: content.number, loading: false});
    }

    componentWillUnmount() {
        global.wsOnMessage.splice(this.userMatchesLeft.reqId, 1);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        const quick = this.props.quick 
        //if (quick && this.state.leftMatches === 0) redirect
        return (
            <div>
                {this.state.leftMatches ? <Lobbies quick={quick} /> : <CapReach quick={quick} />}
                <hr />
                <MyLobby leftMatches={this.state.leftMatches} quick={quick} />
            </div>
        );
    }
}

function CapReach(props) {
    return <p>You have reached the maximum number of concurrent games (lobbies included) for {props.quick} games</p>
}

class Lobbies extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <div>
                <p>There are no existing game yet</p>

            </div>
        );
    }
}

class MyLobby extends React.Component {
    constructor(props) {
        super(props);

        this.myLobbyRequest = {type: "matches-mylobby", f: this.getMyLobby, reqId: null};

        this.state = {
            myLobby: null,
            loading: true
        };
    }

    componentDidMount() {
        this.myLobbyRequest.reqId = global.wsOnMessage.push(this.myLobbyRequest) - 1;
        global.wsSend({type: this.myLobbyRequest.type, quick: this.props.quick});
    }

    getMyLobby = (content) => {
        if (content.quick === this.props.quick)
            this.setState({myLobby: content.lobby, loading: false});
    }

    componentWillUnmount() {
        global.wsOnMessage.splice(this.myLobbyRequest.reqId, 1);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        return (
            <div>

            </div>
        );
    }
}



export default LobbyPage;