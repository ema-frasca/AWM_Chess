import React from "react";
import { Link } from "react-router-dom"
import { LoadingPage, addWsListener, removeWsListener, PieceImg } from "./utils"


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
        this.userMatchesLeft.reqId = addWsListener(this.userMatchesLeft);
        global.wsSend({type: this.userMatchesLeft.type, quick: this.props.quick});
    }

    getLeftMatches = (content) => {
        if (content.quick === this.props.quick)
            this.setState({leftMatches: content.number, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.userMatchesLeft.reqId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        const quick = this.props.quick 
        //if (quick && this.state.leftMatches === 0) redirect ATTT
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
    return <p>You have reached the maximum number of concurrent games (lobbies included) for {props.quick ? "quick" : "slow"} games</p>
}

class Lobbies extends React.Component {
    constructor(props) {
        super(props);

        this.lobbiesRequest = {type: "matches-lobbies", f: this.getLobbies, reqId: null};

        this.state = {
            lobbies: null,
            loading: true
        };
    }

    componentDidMount() {
        this.lobbiesRequest.reqId = addWsListener(this.lobbiesRequest);
        this.sendRequest();
    }

    sendRequest = () => {
        global.wsSend({type: this.lobbiesRequest.type, quick: this.props.quick});
    }

    getLobbies = (content) => {
        if (content.quick === this.props.quick)
            this.setState({lobbies: content.lobbies, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.lobbiesRequest.reqId);
    }

    render () {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;

        return (
            <div>
                {this.state.lobbies.length ? null : <p>There are no existing game yet</p>}
                {this.state.lobbies.map((lobby, i) => (
                    <ShowLobbyLink {...lobby} key={i} />
                ))}
                <button onClick={this.sendRequest}>Update</button>
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
            options: null,
            loading: true
        };
    }

    componentDidMount() {
        this.myLobbyRequest.reqId = addWsListener(this.myLobbyRequest);
        global.wsSend({type: this.myLobbyRequest.type, quick: this.props.quick});
    }

    getMyLobby = (content) => {
        if (content.quick === this.props.quick)
            this.setState({myLobby: content.lobby, options: content.options, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.myLobbyRequest.reqId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        const myLobby = this.state.myLobby
        if (myLobby === false && this.props.leftMatches === 0)
            return null;
        return (
            <div>
                {myLobby ? 
                    <ShowMyLobby {...myLobby} /> 
                    : 
                    <CreateLobby quick={this.props.quick} options={this.state.options} /> }
            </div>
        );
    }
}

class CreateLobby extends React.Component {
    constructor(props) {
        super(props);

        this.createMsg = {type: "matches-create", quick: props.quick};

        this.state = {
            onEdit: false,
            color: props.options.colors[0],
            time: props.options.times[0]
        };
    }

    toggleEdit = (e) => {
        const onEdit = !this.state.onEdit;
        this.setState({onEdit: onEdit});
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        global.wsSend({
            type: this.createMsg.type,
            quick: this.props.quick,
            color: this.state.color,
            time: parseInt(this.state.time)
        });
    }

    render() {
        const btnText = this.state.onEdit ? "cancel" : "Create game";
        const timeLabel = this.props.quick ? "Total time per player" : "Time per move";
        const opts = this.props.options

        return (
            <div>
                <button onClick={this.toggleEdit}>{btnText}</button>
                <form onSubmit={this.handleSubmit} className={this.state.onEdit ? "" : "hidden"}>
                    <table>
                        <tbody>
                        <tr><td>Chess pieces: </td><td>
                            <select name="color" value={this.state.color} onChange={this.handleChange}>
                                {opts.colors.map((op, i) => <option value={op} key={i} className="select-items" >{op}</option>)}
                            </select></td></tr>
                        <tr><td>{timeLabel}: </td><td>
                            <select name="time" value={this.state.time} onChange={this.handleChange}>
                                {opts.times.map((op, i) => <option value={op} key={i}>{op} {opts.unit}</option>)}
                            </select></td></tr>
                        </tbody>
                    </table>
                    <button type="submit">enter</button>
                </form>
            </div>
        );
    }
}

function ShowLobbyLink(props){
    return(
        <Link to={"/game/" + props.id} className="lobby-link">
            <ShowLobby {...props} />
        </Link>
    );
}

function ShowMyLobby(props) {
    return(
        <div style={{display: "flex"}}>
            <ShowLobby {...props} />
            <button onClick={(e) => {
                global.wsSend({type: "matches-delete", id: props.id, quick: props.quick});
            }}>delete</button>
        </div>
    );
}

function ShowLobby(props) {
    // props: {"id":16,"random":true,"quick":false,"time":720,"white":"semgay","category":"Novice"}
    let username, colorIcon = null, piecesText =  null;

    if ("black" in props) {
        username = props.black;
        colorIcon = <PieceImg piece="black_king"/>;
    } else {
        username = props.white;
        colorIcon = <PieceImg piece="white_king"/>;
    }
    
    if (props.random === true) {
        piecesText = "Chess pieces: random";
        colorIcon = null;
    }

    let timeStr;
    if (props.quick)
        timeStr = props.time + " minutes";
    else
        timeStr = props.time / 60 + " hours";

    return(
        <div className="lobby-box">
            <p><span>{username}</span><span>({props.category})</span>{colorIcon}<span>{timeStr}</span></p>
            <h6>{piecesText}</h6>
        </div>
    );
}



export default LobbyPage;