import React from "react";
import { useParams } from "react-router-dom";

class GamePage extends React.Component {
    constructor(props) {
        super(props);
        this.id = useParams().id;

    }

    // {this.props.match.params.id}

    render() {
        return (
            <div>
                Game {this.id}
            </div>
        );
    }
}

export default GamePage;