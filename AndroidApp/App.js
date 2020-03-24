import React from 'react';
import {connect} from "./src/config"

import { View, AsyncStorage } from 'react-native';

import { FadeInView} from './src/styles'
import { LoadingScreen } from "./src/utils";
import Root from './src/root';
import { loadAsync } from 'expo-font';
import { SplashScreen } from 'expo';


// Splash screen showed until the font is not loaded
SplashScreen.preventAutoHide();

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {fontloaded: false};
	}
	
	async componentDidMount() {
		await loadAsync({
			'comic-sans': require('./assets/fonts/comic-sans-ms.ttf'),
			'comic-sans-bold': require('./assets/fonts/comic-sans-ms-bold.ttf')
		});

		const host = await AsyncStorage.getItem('wsHost');
		if (host)
			global.host = host;

		connect();
		this.setState({fontloaded: true});
		SplashScreen.hide();
	}
	
	render () {
		if (!this.state.fontloaded)
			return null;
		return (
			<View style={{flex: 1}}>
				<FadeInView>
				<Root />
				</FadeInView>
				<LoadingScreen />
			</View>
		);
	}
}

