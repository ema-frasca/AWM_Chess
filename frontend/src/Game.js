import React from "react";
import { useParams } from "react-router-dom";
import { LoadingPage, addWsListener, removeWsListener, PieceImg } from "./utils"

function GamePage(){
    let { id } = useParams()
    return <Game id={id} />
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.gameRequest = {type: "game-page", f: this.getGame, reqId: null};
        this.id = parseInt(this.props.id)

        this.state = {
            game: null,
            loading: true
        };
    }

    componentDidMount() {
        this.gameRequest.reqId = addWsListener(this.gameRequest);
        global.wsSend({type: this.gameRequest.type, id: this.id});
    }

    getGame = (content) => {
        if (content.id === this.id)
            this.setState({game: content, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.gameRequest.reqId);
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
    return(
        <div>

        </div>
    );
}


function InGame(props){
    return(
        <div>
            <div className='game-container'>
                <UserTime user={props.match.black} time={props.match.time.black} piece="k" turn={!props.match.whiteTurn}/>
                <ChessBoard board={props.board} moves={props.moves} id={props.id}/>
                <UserTime user={props.match.white} time={props.match.time.white} piece="K" turn={props.match.whiteTurn}/>
                <ChessButtons id={props.id} claim={props.claim}/>
            </div>
            <MovesList pgn={props.match.pgn}/>
            {/*JSON.stringify(props)*/}
        </div>
    );
}

class UserTime extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            time : props.time,
        };

        this.timer = null;
    }

    componentDidMount() {
        this.componentDidUpdate({turn: false, time: this.props.time});
    }

    componentDidUpdate(oldProps) {
        if (this.props.turn !== oldProps.turn) {
            this.setState({time: this.props.time})
            if (this.props.turn)
                this.timer = setInterval(this.tick, 60000);
            else 
                clearInterval(this.timer);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    tick = () => {
        const time = this.state.time - 1;
        this.setState({time: time});
    }

    render() {
        const time = (parseInt(this.state.time/60)).toString().padStart(2, "0") + ":" +(this.state.time%60).toString().padStart(2, "0");
        return(
            <div>
                <UserLine user={this.props.user} piece={this.props.piece} turn={this.props.turn}/>
                <p className="user-time">{time}</p>
            </div>
        );
    }
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
                { props.pgn.map((turn, i) => <h4 key={i}>{turn}</h4>)}
        </div>
    );
}

function ChessButtons(props){
    return(
        <div style={{clear:"both"}}>
            <button disabled={!props.claim} onClick={() => alert('Draw')}>Claim Draw</button>
            <button onClick={() => alert('Resign')}>Resign</button>
        </div>
    );
}

class ChessBoard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected : null,
        };

        this.columns = ["a", "b", "c", "d", "e", "f", "g", "h"]
    }

    handleClick = (id) => {
        if (this.state.selected && id in this.props.moves[this.state.selected]) {
            // controllo promotion
            global.wsSend({type: "game-move", move: this.state.selected + id, id: this.props.id})
            this.setState({selected: null});    
        }
        else
            this.setState({selected: id});    
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
                        <tr><th></th>{this.columns.map((c) => <th key={c}>{c}</th>)}</tr>
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

export default GamePage;