import React from "react";
import { useParams } from "react-router-dom";
import { LoadingPage, addWsListener, removeWsListener, PieceImg, displayTime, TimerDisplay } from "./utils"

function GamePage(){
    let { id } = useParams()
    return <Game id={id} />
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        // ws message: {type: "notify", (id: NUMBER)}
        this.notificationListener = {type: "notify", f: this.onNotification, notId: null}
        // ws message: {type: "game-page", id: NUMBER, ((error: STRING) or (MATCHENDED) or (INMATCH))}
        //  MATCHENDED: {match: {pgn: [STRING], black: USER, white: USER, result: STRING, reason: STRING}, board: STRING, result: STRING}
        //  INMATCH: {match: {MDICT}, board: STRING, claim: BOOL, moves: (obj)}
        //   MDICT: {pgn: [STRING], black: USER, white: USER, time: {black: NUMBER, white: NUMBER}, whiteTurn: BOOL}
        //   USER: {username: STRING, category: STRING}
        //   moves obj example: {'e2': {'e4':[], 'e5': []} 'f7': {'f8': ['q', 'r']}} or {} 
        this.gameRequest = {type: "game-page", f: this.getGame, reqId: null};
        this.id = parseInt(this.props.id)

        this.state = {
            game: null,
            loading: true
        };
    }

    componentDidMount() {
        this.gameRequest.reqId = addWsListener(this.gameRequest);
        this.notificationListener.notId = addWsListener(this.notificationListener);
        this.requestPage();
    }

    requestPage = () => {
        global.wsSend({type: this.gameRequest.type, id: this.id});
    }

    getGame = (content) => {
        if (content.id === this.id)
            this.setState({game: content, loading: false});
    }

    onNotification = (content) => {
        if (content.id === this.id)
            this.requestPage();
    }

    componentWillUnmount() {
        removeWsListener(this.gameRequest.reqId);
        removeWsListener(this.notificationListener.notId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        const game = this.state.game;
        if ("error" in game)
            return <p>{game.error}</p>;
        if ("result"in game)
            return <EndedGame {...game}/>;
        else
            return <InGame {...game}/>;
    }
}

function EndedGame(props){
    let msgLines = {white: "", black: ""};
    if (props.match.result === "White") {
        msgLines = {white: "Winner", black: "Loser"};
    } else if (props.match.result === "Black")
        msgLines = {white: "Loser", black: "Winner"};
    
    return(
        <div>
        <div className='game-container'>
            <UserResult user={props.match.black} result={msgLines.black} piece="k"/>
            <ChessBoard board={props.board} moves={{}} id={props.id} whiteTurn={false}/>
            <UserResult user={props.match.white} result={msgLines.white} piece="K"/>
        </div>
        <MovesList pgn={props.match.pgn}/>
        <ResultReason result={props.result} reason={props.match.reason} />
        </div>
    );
}

function UserResult(props) {
    let className = "result-line"
    if (props.result === "Winner")
        className += " zooming"
    return(
        <div>
            <UserLine user={props.user} piece={props.piece} turn={false}/>
            <p className={className}>{props.result}</p>
        </div>
    );
}

function ResultReason(props) {
    return(
        <div className="moves-list">
            <h2>{props.result}</h2>
            <h4>The match ended because of <b>{props.reason}</b></h4>
        </div>
    );
}

function InGame(props){
    return(
        <div>
            <div className='game-container'>
                <UserTime user={props.match.black} time={props.match.time.black} piece="k" turn={!props.match.whiteTurn}/>
                <ChessBoard board={props.board} moves={props.moves} id={props.id} whiteTurn={props.match.whiteTurn}/>
                <UserTime user={props.match.white} time={props.match.time.white} piece="K" turn={props.match.whiteTurn}/>
                <ChessButtons id={props.id} claim={props.claim}/>
            </div>
            <MovesList pgn={props.match.pgn}/>
        </div>
    );
}

function UserTime(props) {
    return(
        <div>
            <UserLine user={props.user} piece={props.piece} turn={props.turn}/>
            <p className="user-time">{props.turn ? <TimerDisplay time={props.time} /> : displayTime(props.time)}</p>
        </div>
    );
}

function UserLine(props){
    return(
        <p className="user-line">
            <PieceImg className={props.turn ? "jumping" : ""} piece={props.piece}/>
            <span>{props.user.username}</span>
            <span>({props.user.category})</span>
        </p>
    );
}

function MovesList(props){
    return(
        <div className="moves-list">
            <h3>History</h3>
            <div>
                {props.pgn.map((turn, i) => <h5 key={i}>{turn}</h5>)}
            </div>
        </div>
    );
}

// props.moves example: {'e2': {'e4':[], 'e5': []} 'f7': {'f8': ['q', 'r']}} or {} 
// props.board example: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R"
class ChessBoard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected : null,
            promotion : null
        };

        // options for promotion
        this.options = [ "q", "b", "n", "r"]
        this.columns = ["a", "b", "c", "d", "e", "f", "g", "h"]
    }

    handleClick = (idCell) => {
        if (this.state.selected && idCell in this.props.moves[this.state.selected]) {
            if (this.props.moves[this.state.selected][idCell].length){
                this.setState({promotion: idCell});
            }
            else {
                global.wsSend({type: "game-move", move: this.state.selected + idCell, id: this.props.id});
                this.setState({selected: null});    
            }
        }
        else
            this.setState({selected: idCell});    
    }

    promotionClick = (el) => {
        if (el) 
            global.wsSend({type: "game-move", move: this.state.selected + this.state.promotion + el, id: this.props.id});
        this.setState({selected: null, promotion: null});
    }

    buttonRender = (column, row, piece) => {
        const id = column + row;
        let enabled = (id in this.props.moves) ? true : false;
        let className = "";

        if (this.state.selected){
            if (id in this.props.moves[this.state.selected]){
                className = "target";
                enabled = true;
            }
        }

        return (
            <td key={id}>
                <button id={id} name={id} disabled={!enabled} className={className} onClick={() => this.handleClick(id)}><PieceImg piece={piece}/> </button>
            </td>
        );
    }

    render(){
        return(
            <div className="board">
                <table>
                    <tbody>
                        <tr>
                            <th>
                                {this.state.promotion ? <OnPromotion options={this.options} onClick={this.promotionClick} whiteColor={this.props.whiteTurn}/> : null}  
                            </th>
                            {this.columns.map((c) => <th key={c}>{c}</th>)}
                        </tr>
                        {this.props.board.split('/').map((line, row, obj, offset=0) => (
                            <tr key={row}>
                                <th>{8 - row}</th>
                                {line.split('').map((piece, column) => {
                                    const n = parseInt(piece);
                                    if (n){
                                        let blankSpaces = [];
                                        for(let i=0; i<n; i++, offset++){
                                            blankSpaces.push(this.buttonRender(this.columns[column+offset], 8 - row, "empty"));
                                        }
                                        offset--;
                                        return blankSpaces;
                                    } else                                        
                                        return this.buttonRender(this.columns[column+offset], 8 - row, piece);
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

function ChessButtons(props){
    return(
        <div style={{clear:"both"}}>
            <button disabled={!props.claim} onClick={() => global.wsSend({type: "game-claim", id: props.id})}>Claim Draw</button>
            <button onClick={() => global.wsSend({type: "game-resign", id: props.id})}>Resign</button>
        </div>
    );
}

class OnPromotion extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected : props.options[0],
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.onClick(this.state.selected);
    }

    render(){
    return(
            <div className="promotion">
                <form onSubmit={this.handleSubmit}>
                    {this.props.options.map((piece, i) => (
                        <label key={i}>
                            <PieceImg piece={this.props.whiteColor ? piece.toUpperCase() : piece}/>
                            <input type="radio" name="promotion"
                                value={piece}
                                checked={this.state.selected === piece}
                                onChange={(e) => this.setState({selected: e.target.value})}
                            />
                        </label>
                    ))}
                    <br />
                    <input className="button" type="submit" value="confirm" />
                    <input className="button" type="button" value="cancel" onClick={() => this.props.onClick(null) } />
                </form>
            </div>
        );
    }
}

export default GamePage;