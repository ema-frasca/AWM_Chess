import React from "react";

class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        this.wsChange();
        global.wsOnStateChange.push(this.wsChange);
    }

    wsChange = () => {
        if (global.ws)
            this.setState({loading: false})
        else
            this.setState({loading: true})
    }

    render () {
        let divClass = this.state.loading ? "loading-socket" : "hidden";

        return (
            <div className={divClass}>
                <img className="loading-icon" src={global.imgs + "loading.png"} alt="loading"/>
            </div>
        );
    }
}

function LoadingPage(props) {
    return (
        <div className={props.loading ? "loading-page" : "hidden"}>
            <img className="loading-icon" src={global.imgs + "loading.png"} alt="loading"/>
        </div>
    );
}

export { LoadingScreen, LoadingPage };