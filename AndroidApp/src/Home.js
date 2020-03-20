import React from 'react'
import { View, ScrollView } from 'react-native'
import { addWsListener, removeWsListener, LoadingPage, TimerDisplay, ExpoNotification } from './utils'
import styles, { FadeInView, MyText, InlineView, GameLink, PoppingView } from './styles'


class HomePage extends React.Component {
  constructor(props) {
	  super(props);

	  this.notificationListener = {type: "notify", f: this.onNotification, notId: null};
	  this.homeRequest = {type: "home-page", f: this.getHome, reqId: null};

	  this.state = {
		  list: null,
		  user: null,
		  history: null,
		  loading: true
	  };
  }

  componentDidMount() {
	  this.homeRequest.reqId = addWsListener(this.homeRequest);
	  this.notificationListener.notId = addWsListener(this.notificationListener);
	  this.requestPage();
  }

  requestPage = () => {
	  global.wsSend({type: this.homeRequest.type});
  }

  getHome = (content) => {
	  this.setState({list: content.list, history: content.history, user: content.username, loading: false});
  }

  onNotification = (content) => {
	  this.requestPage();
  }
  
  componentWillUnmount() {
	  removeWsListener(this.homeRequest.reqId);
	  removeWsListener(this.notificationListener.notId);
  }

  render() {
	  if (this.state.loading)
		  return <LoadingPage />;
	  return (
		<ScrollView style={{paddingHorizontal: '1%', paddingTop: '3%'}}>
			<ExpoNotification />
			<FadeInView style={styles.bottomSpace}>
				<MyText bold size={1} center >Welcome {this.state.user}</MyText>
				{this.state.list.map((match, i) => (
					<ShowMatchLink {...match} ended={false} key={i} />
				))}
				<MyText bold size={2} center style={styles.topLine}>History</MyText>
				{this.state.history.map((match, i) => (
					<ShowMatchLink {...match} ended={true} key={i} />
				))}
			</FadeInView>
		</ScrollView>
	  );
  }
}

function ShowMatchLink(props){
	return(
		<GameLink id={props.id}>
			{props.ended ? <EndedMatchLine {...props} /> : <InMatchLine {...props} />}
		</GameLink>
	);
}

function InMatchLine(props){
	// popping turn animation
	return(
		<FadeInView style={styles.gameBox}>
			<InlineView>
                <MyText bold>vs {props.vs.username}</MyText>
                <MyText>{props.vs.category}</MyText>
            </InlineView>
            <InlineView>
				<PoppingView><MyText bold>{props.turn ? "Your turn" : null}</MyText></PoppingView>
				<TimerDisplay time={props.time} updateTime={(new Date()).getTime()} />
            </InlineView>
		</FadeInView>
	);
}

function EndedMatchLine(props){
	return(
		<View style={styles.gameBox}>
			<InlineView>
                <MyText bold>vs {props.vs}</MyText>
                <MyText>{props.result}</MyText>
            </InlineView>
		</View>
	);
}

export default HomePage;