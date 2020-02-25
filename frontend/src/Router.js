import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import HomePage from "./Home"
import LobbyPage from "./Lobby"
import AccountPage from "./Account"
import GamePage from "./Game"


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

class NotificationPop extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <span id="notification">2</span>
        );
    }
}

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
                <img className="loading-icon" src="/static/img/loading.png" alt="loading"/>
            </div>
        );
    }
}

export default App;