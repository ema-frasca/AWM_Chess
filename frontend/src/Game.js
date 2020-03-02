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
                <ChessBoard board={props.board} moves={props.moves}/>
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
                <p style={{float:"right"}}>{time}</p>
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
    }

    render(){
        return(
            <div className="board">
                <table>
                    <tbody>
                        {this.props.board.split('/').map((line, column) => (
                            <tr>
                                {line.split('').map((piece, row) => {
                                    const n = parseInt(piece);
                                    if (n){
                                        let blankSpaces = []
                                        for(let i=0; i<n; i++)
                                            blankSpaces.push(<td><button></button></td>);
                                        return blankSpaces;
                                    } else                                        
                                        return (
                                            <td>
                                                <button><PieceImg piece={piece}/> </button>
                                            </td>
                                        );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
            </div>
        );
    }
    //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
}

export default GamePage;