import React from "react";
import { useParams } from "react-router-dom";

function GamePage(){
    let { id } = useParams()
    return <Game id={id} />
}

class Game extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                Game {this.props.id}
            </div>
        );
    }
}

export default GamePage;