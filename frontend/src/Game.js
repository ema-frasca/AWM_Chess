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

        </div>
    );
}

function UserTime(props){
    return(
        <div>

        </div>
    );
}

function UserLine(props){
    return(
        <div>

        </div>
    );
}

function MovesList(props){
    return(
        <div>

        </div>
    );
}

class ChessBoard extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div>

            </div>
        );
    }
    
}

export default GamePage;