import React from 'react'
import { View, Picker, TouchableHighlight, ScrollView } from 'react-native'
import { addWsListener, removeWsListener, PieceImg, LoadingPage } from './utils'
import styles, { FadeInView, MyText, MyButton, MyPicker, InlineView } from './styles'
import { RFPercentage } from "react-native-responsive-fontsize";
import { useNavigation } from '@react-navigation/native';


class LobbyPage extends React.Component {
    constructor(props) {
        super(props);

        this.userMatchesLeft = {type: "matches-left", f: this.getLeftMatches, reqId: null};

        this.quick = props.route.params.quick;
        this.state = {
            leftMatches: null,
            redirectId: null,
            loading: true
        };
    }

    componentDidMount() {
        this.userMatchesLeft.reqId = addWsListener(this.userMatchesLeft);
        global.wsSend({type: this.userMatchesLeft.type, quick: this.quick});
    }

    getLeftMatches = (content) => {
        if (content.quick === this.quick)
            this.setState({leftMatches: content.number, redirectId: content.redirect, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.userMatchesLeft.reqId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />;
        if (this.quick && this.state.leftMatches === 0 && this.state.redirectId)
            this.props.navigation.jumpTo('Home')
        return (
            <ScrollView style={{paddingHorizontal: '1%', paddingTop: '3%'}}>
                <FadeInView>
                    {this.state.leftMatches ? <Lobbies quick={this.quick} /> : <CapReach quick={this.quick} />}
                    <MyLobby leftMatches={this.state.leftMatches} quick={this.quick} />
                </FadeInView>
            </ScrollView>
        );
    }
}

function CapReach(props) {
    return <MyText>You have reached the maximum number of concurrent games (lobbies included) for {props.quick ? "quick" : "slow"} games</MyText>
}

class Lobbies extends React.Component {
    constructor(props) {
        super(props);

        this.lobbiesRequest = {type: "matches-lobbies", f: this.getLobbies, reqId: null};

        this.state = {
            lobbies: null,
            loading: true,
        };
    }

    componentDidMount() {
        this.lobbiesRequest.reqId = addWsListener(this.lobbiesRequest);
        this.sendRequest();
    }

    sendRequest = () => {
        global.wsSend({type: this.lobbiesRequest.type, quick: this.props.quick});
    }

    getLobbies = (content) => {
        if (content.quick === this.props.quick)
            this.setState({lobbies: content.lobbies, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.lobbiesRequest.reqId);
    }

    render () {
        if (this.state.loading)
            return <LoadingPage />;

        return (
            <FadeInView>
                {this.state.lobbies.length ? null : <MyText>There are no existing game yet</MyText>}
                {this.state.lobbies.map((lobby, i) => (
                    <ShowLobbyLink {...lobby} key={i} />
                ))}
                <MyButton onPress={this.sendRequest}>Update</MyButton>
            </FadeInView>
        );
    }
}

class MyLobby extends React.Component {
    constructor(props) {
        super(props);

        this.myLobbyRequest = {type: "matches-mylobby", f: this.getMyLobby, reqId: null};

        this.state = {
            myLobby: null,
            options: null,
            loading: true
        };
    }

    componentDidMount() {
        this.myLobbyRequest.reqId = addWsListener(this.myLobbyRequest);
        global.wsSend({type: this.myLobbyRequest.type, quick: this.props.quick});
    }

    getMyLobby = (content) => {
        if (content.quick === this.props.quick)
            this.setState({myLobby: content.lobby, options: content.options, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.myLobbyRequest.reqId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />;
        const myLobby = this.state.myLobby
        if (myLobby === false && this.props.leftMatches === 0)
            return null;
        return (
            <FadeInView style={{borderTopColor: "black", borderTopWidth: RFPercentage(0.5) }}>
                {myLobby ? 
                    <ShowMyLobby {...myLobby} /> 
                    : 
                    <CreateLobby quick={this.props.quick} options={this.state.options} /> }
            </FadeInView>
        );
    }
}

class CreateLobby extends React.Component {
    constructor(props) {
        super(props);

        this.createMsg = {type: "matches-create", quick: props.quick};

        this.state = {
            onEdit: false,
            color: props.options.colors[0],
            time: props.options.times[0]
        };
    }

    toggleEdit = (e) => {
        const onEdit = !this.state.onEdit;
        this.setState({onEdit: onEdit});
    }

    handleSubmit = () => {
        global.wsSend({
            type: this.createMsg.type,
            quick: this.props.quick,
            color: this.state.color,
            time: parseInt(this.state.time)
        });
    }

    render() {
        const btnText = this.state.onEdit ? "cancel" : "Create game";
        const timeLabel = this.props.quick ? "Total time per player" : "Time per move";
        const opts = this.props.options

        return (
            <View>
                <MyButton onPress={this.toggleEdit}>{btnText}</MyButton>
                {this.state.onEdit ? (
                    <FadeInView>
                        <MyPicker title="Chess pieces"
                            selectedValue={this.state.color} 
                            onValueChange={(value, i) => this.setState({color: value})} 
                        >
                            {opts.colors.map((op, i) => <Picker.Item value={op} label={op} key={i} />)}
                        </MyPicker>
                        <MyPicker title={timeLabel}
                                selectedValue={this.state.time} 
                                onValueChange={(value, i) => this.setState({time: value})}
                        >
                            {opts.times.map((op, i) => <Picker.Item value={op} label={op + ' ' + opts.unit} key={i} />)}
                        </MyPicker>
                        <MyButton onPress={this.handleSubmit}>enter</MyButton>
                    </FadeInView>
                ) : null}
            </View>
        );
    }
}

//const press = () => {navigation.jumpTo('Home', {screen: "Game", params: {id: props.id}})};
//const press = () => {navigation.jumpTo('Home', {id: props.id})};
function ShowLobbyLink(props){
    // className="lobby-link"
    const navigation = useNavigation()
    const press = () => {navigation.jumpTo('Home', {screen: "Game", params: {id: props.id}})};
    return(
        <TouchableHighlight onPress={press} underlayColor="rgb(255, 255, 240)" activeOpacity={0.5} >
            <ShowLobby {...props} />
        </TouchableHighlight>
    );
}

function ShowMyLobby(props) {
    return(
        <View>
            <ShowLobby {...props} />
            <MyButton onPress={() => {
                global.wsSend({type: "matches-delete", id: props.id, quick: props.quick});
            }}>delete</MyButton>
        </View>
    );
}

function ShowLobby(props) {
    // className="lobby-box"
    let username, category, colorIcon = null, piecesText =  null;

    if ("black" in props) {
        username = props.black.username;
        category = props.black.category;
        colorIcon = <PieceImg piece="k"/>;
    } else {
        username = props.white.username;
        category = props.white.category;
        colorIcon = <PieceImg piece="K"/>;
    }
    
    if (props.random === true) {
        piecesText = "Chess pieces: random";
        colorIcon = null;
    }

    let timeStr;
    if (props.quick)
        timeStr = props.time + " minutes";
    else
        timeStr = props.time / 60 + " hours";

    return(
        <View style={{borderColor: 'black', borderWidth: RFPercentage(1), margin: RFPercentage(0.5)}} >
            <InlineView>
                <MyText bold>{username}</MyText>
                <MyText>({category})</MyText>
                {colorIcon}
                <MyText>{timeStr}</MyText>
            </InlineView>
            {colorIcon === null ? <MyText size={6}>{piecesText}</MyText> : null}
        </View>
    );
}

export default LobbyPage;