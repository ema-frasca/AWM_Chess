import React from 'react'
import { View, TouchableHighlight, ScrollView } from 'react-native'
import { addWsListener, removeWsListener, LoadingPage, 
    TimerDisplay, displayTime, PieceImg } from './utils'
import styles, { FadeInView, MyText, InlineView, PoppingView, MyButton } from './styles'
import { RFPercentage } from "react-native-responsive-fontsize";


class GamePage extends React.Component {
    constructor(props) {
        super(props);

        // ws message: {type: "notify", (id: NUMBER)}
        this.notificationListener = {type: "notify", f: this.onNotification, notId: null}
        // ws message: {type: "game-page", id: NUMBER, ((error: STRING) or (MATCHENDED) or (INMATCH))}
        //  MATCHENDED: {match: {pgn: [STRING], black: USER, white: USER, result: STRING, reason: STRING}, board: STRING, result: STRING}
        //  INMATCH: {match: {MDICT}, board: STRING, claim: BOOL, moves: (obj)}
        //   MDICT: {pgn: [STRING], black: USER, white: USER, time: {black: NUMBER, white: NUMBER}, whiteTurn: BOOL}
        //   USER: {username: STRING, category: STRING}
        //   moves obj example: {'e2': {'e4':[], 'e5': []} 'f7': {'f8': ['q', 'r']}} or {} 
        this.gameRequest = {type: "game-page", f: this.getGame, reqId: null};
        this.id = parseInt(this.props.id)

        this.state = {
            game: null,
            loading: true
        };
        this.id = props.route.params.id;
    }

    componentDidMount() {
        this.gameRequest.reqId = addWsListener(this.gameRequest);
        this.notificationListener.notId = addWsListener(this.notificationListener);
        this.requestPage();
    }

    requestPage = () => {
        global.wsSend({type: this.gameRequest.type, id: this.id});
    }

    getGame = (content) => {
        if (content.id === this.id)
            this.setState({game: content, loading: false});
    }

    onNotification = (content) => {
        if (content.id === this.id)
            this.requestPage();
    }

    componentWillUnmount() {
        removeWsListener(this.gameRequest.reqId);
        removeWsListener(this.notificationListener.notId);
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />;
        const game = this.state.game;
        if ("error" in game)
            return <FadeInView style={styles.mainView}><MyText color="red" center>{game.error}</MyText></FadeInView>;
        
        return(
            <ScrollView style={styles.mainView}>
                {"result" in game ? <EndedGame {...game}/> : <InGame {...game}/>}
            </ScrollView>
        );
    }
}

function EndedGame(props){
    let msgLines = {white: "", black: ""};
    if (props.match.result === "White") {
        msgLines = {white: "Winner", black: "Loser"};
    } else if (props.match.result === "Black")
        msgLines = {white: "Loser", black: "Winner"};
    
    return(
        <FadeInView>
            <UserResult user={props.match.black} result={msgLines.black} piece="k"/>
            <ChessBoard board={props.board} moves={{}} id={props.id} />
            <UserResult user={props.match.white} result={msgLines.white} piece="K"/>
            <ResultReason result={props.result} reason={props.match.reason} />
            <MovesList pgn={props.match.pgn}/>
        </FadeInView>
    );
}

function InGame(props){
    return(
        <FadeInView>
            <UserTime user={props.match.black} time={props.match.time.black} piece="k" turn={!props.match.whiteTurn}/>
            <ChessBoard board={props.board} moves={props.moves} id={props.id} whiteTurn={props.match.whiteTurn}/>
            <UserTime user={props.match.white} time={props.match.time.white} piece="K" turn={props.match.whiteTurn}/>
            <ChessButtons id={props.id} claim={props.claim}/>
            <MovesList pgn={props.match.pgn}/>
        </FadeInView>
    );
}

function UserResult(props) {
    return(
        <InlineView>
            <UserLine user={props.user} piece={props.piece} turn={false}/>
            {props.result === "Winner" ? (
                <PoppingView>
                    <MyText color="green" bold>{props.result}</MyText>
                </PoppingView>
            ) : (
                <MyText flex={1} center bold>{props.result}</MyText>
            )}
        </InlineView>
    );
}

function ResultReason(props) {
    return(
        <View style={styles.listView}>
            <MyText bold size={2}>{props.result}</MyText>
            <MyText>The match ended because of <MyText bold>{props.reason}</MyText></MyText>
        </View>
    );
}

function UserTime(props) {
    return(
        <InlineView>
            <UserLine user={props.user} piece={props.piece} turn={props.turn}/>
            {props.turn ? <TimerDisplay time={props.time} /> : <MyText flex={1} center>{displayTime(props.time)}</MyText>}
        </InlineView>
    );
}

function UserLine(props){
    return(
        <InlineView style={{flex: 2}}>
            {props.turn ? (
                <PoppingView>
                    <PieceImg piece={props.piece} icon/>
                </PoppingView>
            ) : <View style={{paddingLeft: '5%'}}><PieceImg piece={props.piece} icon/></View> }
            <MyText bold>{props.user.username}</MyText>
            <MyText>({props.user.category})</MyText>
        </InlineView>
    );
}

function MovesList(props){
    return(
        <FadeInView style={[styles.listView, styles.bottomSpace]}>
            <MyText bold size={3}>History</MyText>
            <View style={{paddingHorizontal: '2%'}}>
                {props.pgn.map((turn, i) => <MyText color="rgba(0, 0, 0, 0.7)" size={5} key={i}>{turn}</MyText>)}
            </View>
        </FadeInView>
    );
}

function ChessButtons(props){
    return(
        <View style={{paddingTop: '2%'}}>
            <InlineView>
                <MyButton style={{flex: 1}} disabled={!props.claim} onPress={() => global.wsSend({type: "game-claim", id: props.id})}>Claim Draw</MyButton>
                <MyButton style={{flex: 1}} onPress={() => global.wsSend({type: "game-resign", id: props.id})}>Resign</MyButton>
            </InlineView>
        </View>
    );
}

// props.moves example: {'e2': {'e4':[], 'e5': []} 'f7': {'f8': ['q', 'r']}} or {} 
// props.board example: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R"
class ChessBoard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected : null,
            promotion : null
        };

        // options for promotion
        this.options = [ "q", "b", "n", "r"]
        this.columns = ["a", "b", "c", "d", "e", "f", "g", "h"]
    }

    handleClick = (idCell) => {
        if (this.state.selected && idCell in this.props.moves[this.state.selected]) {
            if (this.props.moves[this.state.selected][idCell].length){
                this.setState({promotion: idCell});
            }
            else {
                global.wsSend({type: "game-move", move: this.state.selected + idCell, id: this.props.id});
                this.setState({selected: null});    
            }
        }
        else
            this.setState({selected: idCell});    
    }

    promotionClick = (el) => {
        if (el) 
            global.wsSend({type: "game-move", move: this.state.selected + this.state.promotion + el, id: this.props.id});
        this.setState({selected: null, promotion: null});
    }

    buttonRender = (column, row, piece) => {
        const id = column + row;
        let enabled = (id in this.props.moves) ? true : false;

        // background cell white or black
        const isWhite = (8 - row + this.columns.indexOf(column)) % 2 === 0;
    
        let style = {
            backgroundColor: isWhite ? 'white' : 'black',
            borderColor: 'black',
        };

        // outer border of the board
        borderWidth = RFPercentage(0.2);
        if (row === 8)
            style.borderTopWidth = borderWidth;
        if (row === 1)
            style.borderBottomWidth = borderWidth;
        if (column === "a")
            style.borderLeftWidth = borderWidth;
        if (column === "h")
            style.borderRightWidth = borderWidth;

        let buttonStyle = {};
        if (this.state.selected){
            if (id === this.state.selected)
                buttonStyle.backgroundColor = "rgba(128, 128, 128, 0.5)";
            if (id in this.props.moves[this.state.selected]){
                buttonStyle.backgroundColor = isWhite ? "rgba(100, 170, 40, 0.3)" : "rgba(160, 230, 120, 0.5)";
                enabled = true;
            }
        }

        return (
            <FadeInView style={style} key={id}>
                <TouchableHighlight style={buttonStyle} underlayColor="rgba(128, 128, 128, 0.5)" 
                    disabled={!enabled} onPress={() => this.handleClick(id)}
                >
                    <PieceImg piece={piece}/>
                </TouchableHighlight>
            </FadeInView>
        );
    }

    // css board
    render(){
        const tableStyle = {flex: 1, padding: '1%', aspectRatio: 1};
        const rowStyle = {flex: 1, flexDirection: 'row'};
        return(
            <View style={tableStyle}>
                <View style={rowStyle}>
                    <View style={{flex: 1}}></View>
                    {this.columns.map((c) => <View style={{flex: 1}} key={c}><MyText bold center>{c}</MyText></View>)}
                </View>
                {this.props.board.split('/').map((line, row, obj, offset=0) => (
                    <View key={row} style={rowStyle}>
                        <View style={{flex: 1}}><MyText bold center>{8 - row}</MyText></View>
                        {line.split('').map((piece, column) => {
                            const n = parseInt(piece);
                            if (n){
                                let blankSpaces = [];
                                for(let i=0; i<n; i++, offset++){
                                    blankSpaces.push(this.buttonRender(this.columns[column+offset], 8 - row, "empty"));
                                }
                                offset--;
                                return blankSpaces;
                            } else                                        
                                return this.buttonRender(this.columns[column+offset], 8 - row, piece);
                        })}
                    </View>
                ))}
                {this.state.promotion ? <OnPromotion options={this.options} onPress={this.promotionClick} whiteColor={this.props.whiteTurn}/> : null} 
            </View>
        );
    }
}

function OnPromotion(props) {
    const coverStyle = {
        position: 'absolute', 
        height: '90%',
        width: '90%',
        top: '11%', left: '11%',
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: 'center',
        justifyContent: 'center',
    };

    const formStyle = {
        width: '90%', height: '45%', 
        backgroundColor: 'white', 
        borderRadius: RFPercentage(3),
        padding: '2%',
    }

    return (
        <FadeInView style={coverStyle}>
            <View style={formStyle} >
                <InlineView style={{width: '100%', alignItems: 'center'}}>
                {props.options.map((piece, i) => (
                    <TouchableHighlight style={{width: '25%', aspectRatio: 1}} key={i} underlayColor="white" onPress={() => props.onPress(piece)}>
                        <PieceImg piece={props.whiteColor ? piece.toUpperCase() : piece}/>
                    </TouchableHighlight>
                ))}
                </InlineView>
                <MyButton onPress={() => props.onPress(null)}>cancel</MyButton>
            </View>
        </FadeInView>
    );
}

export default GamePage;