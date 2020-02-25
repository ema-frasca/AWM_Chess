import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";


class Page extends React.Component {
    render() {
        return (
            <p>
                "ciaoooo"
            </p>
        );
    }
}

const menuLines = [
    {text: "HOME", url: "/", component: <Page />},
    {text: "QUICK GAME", url: "/quick", component: <Page />},
    {text: "SLOW GAME", url: "/slow", component: <Page />},
    {text: "ACCOUNT", url: "/user", component: null}
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
                <img className="loading-icon" src="/static/img/loading.png" />
            </div>
        );
    }
}

export default App;