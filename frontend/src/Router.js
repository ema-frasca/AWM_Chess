import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import HomePage from "./Home";
import LobbyPage from "./Lobby";
import AccountPage from "./Account";
import GamePage from "./Game";

import { LoadingScreen, addWsListener, removeWsListener } from "./utils";


// Home should be put as last Route, otherwise it answer any url request
const menuLines = [
    {text: "HOME", url: "/", component: <HomePage />},
    {text: "QUICK GAME", url: "/quick", component: <LobbyPage quick={true} />},
    {text: "SLOW GAME", url: "/slow", component: <LobbyPage quick={false} />},
    {text: "ACCOUNT", url: "/user", component: <AccountPage />}
];

function App() {
    return(
        <div>
            <Router />
            <LoadingScreen />
        </div>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <MainMenu />

            <div id="content">
                <Switch>
                    <Route path="/game/:id">
                        <GamePage />
                    </Route>
                    {menuLines.slice().reverse().map((line, i) => (
                        <Route path={line.url} key={i}>
                            {line.component}
                        </Route>
                    ))}
                </Switch>
            </div>
        </BrowserRouter>
    );
}

function MainMenu() {
    return (
        <div id="main-menu">
            {menuLines.map((line, i) => (
                <MenuLine {...line} key={i} />
            ))}
            <h3><a href="/account/logout">EXIT</a></h3>
        </div>
    );
}

function MenuLine(props) {
    const popup = (props.url === "/") ? <NotificationPop /> : null;

    return (
        <h3>
            <Link to={props.url}>{props.text}{popup}</Link>
        </h3>
    );
}

// Notification number: it express the number of matches in whitch it's your turn
class NotificationPop extends React.Component {
    constructor(props) {
        super(props);

        // ws message: {type: "notify", }
        this.notificationListener = {type: "notify", f: this.onNotification, notId: null}
        this.notificationRequest = {type: "notifications", f: this.getNotification, reqId: null};

        this.state = {
            notifications: 0
        };
    }

    componentDidMount() {
        this.notificationRequest.reqId = addWsListener(this.notificationRequest);
        this.notificationListener.notId = addWsListener(this.notificationListener);
        this.requestPage();
    }

    requestPage = () => {
        global.wsSend({type: this.notificationRequest.type});
    }

    getNotification = (content) => {
        this.setState({notifications: content.number});
    }

    onNotification = (content) => {
        this.requestPage();
    }
    
    componentWillUnmount() {
        removeWsListener(this.notificationRequest.reqId);
        removeWsListener(this.notificationListener.notId);
    }

    render() {
        return (
            <span id="notification">{this.state.notifications ? this.state.notifications : null}</span>
        );
    }
}

export default App;