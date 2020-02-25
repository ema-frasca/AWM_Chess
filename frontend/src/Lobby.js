import React from "react";

class LobbyPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                Lobby {this.props.quick ? "quick" : "slow"}
            </div>
        );
    }
}

export default LobbyPage;