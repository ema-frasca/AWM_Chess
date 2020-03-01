import React from "react";
import { Link } from "react-router-dom";
import { LoadingPage, addWsListener, removeWsListener, PieceImg } from "./utils";

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.homeRequest = {type: "home-page", f: this.getHome, reqId: null};

        this.state = {
            list: null,
            loading: true
        };
    }

    componentDidMount() {
        this.homeRequest.reqId = addWsListener(this.homeRequest);
        global.wsSend({type: this.homeRequest.type});
    }

    getHome = (content) => {
        this.setState({list: content.list, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.homeRequest.reqId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        return (
            <div>
                {this.state.list.map((id, i) => (
                    <p key={i}><Link to={"/game/" + id} >{id}</Link></p>
                ))}
            </div>
        );
    }
}

export default HomePage;