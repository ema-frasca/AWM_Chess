import React from 'react'
import { Animated, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { RFPercentage } from "react-native-responsive-fontsize";
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';


const sizeDict = {
	1: RFPercentage(6.5),
	2: RFPercentage(5.5),
	3: RFPercentage(4.5),
	4: RFPercentage(4),
	5: RFPercentage(3.5),
	6: RFPercentage(3),
};

const styles = {
	text: (size=4, bold=false) => {return {
		fontFamily: bold ? 'comic-sans-bold' : 'comic-sans',
		fontSize: sizeDict[size]
	}},

	header: {
		image: {
			height: '100%',
			width: '100%', 
			alignItems: 'center', 
			justifyContent: 'center',
		},
		text: {
			fontSize: RFPercentage(8),
			fontFamily: 'comic-sans-bold'
		}
	},

	login: {
		routerOptions: {
		headerStatusBarHeight: RFPercentage(1),
		headerTitleAlign: 'center',
		headerTintColor: 'green', 
		headerTitleStyle: { 
			fontFamily: "comic-sans-bold",
			fontSize: sizeDict[2],
			alignSelf: 'flex-start'
		}
		},
		view: {
			flex: 1,
			paddingTop: '5%',
			alignItems: 'center',
		},
		form: {
			width: '70%', 
			alignItems: 'center'
		},
		button: {
			margin: '5%',
			paddingLeft: '5%', paddingRight: '5%',
			marginBottom: '0%',
		}
	},

	button: {
		enabled: {
			backgroundColor: 'rgb(0, 139, 186)',
			borderColor: 'rgb(3, 99, 131)',
			borderWidth: RFPercentage(0.5),
			borderRadius: RFPercentage(1.5),
			alignItems: 'center',
			padding: '2%', margin: '1%',
		},
		disabled: {
			backgroundColor: 'rgba(80, 110, 120, 1)',
			borderColor: 'grey',
			borderWidth: RFPercentage(0.5),
			borderRadius: RFPercentage(1.5),
			alignItems: 'center',
			padding: '2%', margin: '1%',
		}
	},

	gameBox: {
		borderColor: 'black', 
		borderWidth: RFPercentage(1), 
		margin: RFPercentage(1),
		paddingHorizontal: RFPercentage(2),
		paddingVertical: RFPercentage(0.5),
	},

	topLine: {
		borderTopColor: "black", 
		borderTopWidth: RFPercentage(0.5) 
	},

	mainView: {
		paddingHorizontal: '2%', paddingTop: '3%',
		paddingBottom: 200,
	},

	bottomSpace: {marginBottom: '5%'},

	listView: {
		backgroundColor: "rgba(197, 197, 193, 0.5)", 
		borderColor: "rgba(0, 0, 0, 0.8)", 
		borderWidth: RFPercentage(0.5),
		borderRadius: RFPercentage(1),
		paddingHorizontal: '2%',
		margin: '2%',
	}

};

function MyTabBar({ state, descriptors, navigation }) {
	return (
		<View style={{ flexDirection: 'row' }}>
		{state.routes.map((route, index) => {
			const { options } = descriptors[route.key];
			if (options.hidden)
			return null;
			const label = options.title ? options.title : route.name;

			const isFocused = state.index === index;

			const onPress = () => {
			const event = navigation.emit({
				type: 'tabPress',
				target: route.key,
			});

			if (!isFocused && !event.defaultPrevented) {
				navigation.navigate(route.name);
			}
			};

			return (
			<TouchableHighlight
				key={route.name}
				onPress={onPress}
				underlayColor="rgb(255, 255, 220)"
				style={{ flex: 1, justifyContent: 'center', 
				backgroundColor: isFocused ? 'rgb(255, 250, 200)' : 'white',
				borderColor: 'grey',
				borderWidth: 0.5, borderBottomWidth: 0, 
			}}>
				<View>
					{options.icon}
					<MyText size={5} bold center color={isFocused ? 'black' : 'grey'}>
						{label}
					</MyText>
				</View>
			</TouchableHighlight>
			);
		})}
		</View>
	);
}

class FadeInView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {fadeValue: new Animated.Value(0)}
	}

	componentDidMount(){
		Animated.timing(this.state.fadeValue, { toValue: 1, duration: 1000 }).start();
	}

	render(){
		return (
		<Animated.View style={[{flex: 1, opacity: this.state.fadeValue }, this.props.style]}>
			{this.props.children}
		</Animated.View>
		);
	}
}

class PoppingView extends React.Component {
    constructor(props){
        super(props);

        this.state = {scaleValue: new Animated.Value(0)}
        this.style = {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
        };
    }

    componentDidMount(){
        Animated.loop(
            Animated.timing(this.state.scaleValue, {toValue: 1, duration: 1300})
        ).start();    
    }

    render(){
        const scale = this.state.scaleValue.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [1.0, 1.3, 1.0]
          });
        let transformStyle = { transform: [{ scale: scale }] };
        return <Animated.View style={[this.style, transformStyle, this.props.style]}>{this.props.children}</Animated.View>;
    }
}

function MyText(props) {
	const style = {
		color: props.color ? props.color : "black",
		textAlign: props.center ? 'center' : null,
	};
	if (props.flex)
		style.flex = props.flex;
	return (
		<Text {...props} style={[style, styles.text(props.size, props.bold), props.style]} >
			{props.children}
		</Text>
	);
}

function MyTextInput(props) {
	const style = {
		backgroundColor: "white",
		borderColor: "black", 
		borderWidth: RFPercentage(0.5), 
		width: ("width" in props ? props.width : '100%'), 
		paddingLeft: '2%', paddingRight: '2%',
	};
	return (
		<TextInput autoCapitalize="none" autoCorrect={false} autoCompleteType="off" 
			{...props} style={[styles.text(props.size, props.bold), style, props.style]} 
		/>
	);
}

function MyButton(props) {
	const hSize = props.size ? props.size : 4;
	const style = props.disabled ? styles.button.disabled : styles.button.enabled; 
	return (
		<TouchableHighlight {...props} style={[style, props.style]} underlayColor="rgb(70, 163, 194)" activeOpacity={0.5} >
			<MyText size={hSize} color={props.disabled ? "#b7b7b7" : "white"} >{props.children}</MyText>
		</TouchableHighlight>
	);
}

function MyAuthLinks(props){
	const hSize = props.size ? props.size : 4;
	return (
		<TouchableHighlight {...props} underlayColor="white" activeOpacity={0.5} >
			<MyText size={hSize} style={{textDecorationLine: 'underline'}} >{props.children}</MyText>
		</TouchableHighlight>
	);
}

function GameLink(props) {
    const navigation = useNavigation()
	const press = () => {navigation.jumpTo('Game', {id: props.id})};
	return(
        <TouchableHighlight onPress={press} underlayColor="rgb(255, 255, 220)" >
            {props.children}
        </TouchableHighlight>
    );
}

function MyPicker(props){
	return(
		<View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
		<MyText style={{flex: 1}} >{props.title}: </MyText>
		<RNPickerSelect
			placeholder={{}}
			value={props.selectedValue}
			onValueChange={props.onValueChange}
			useNativeAndroidPickerStyle={false}
			style={{
				inputAndroid: [styles.text(), {paddingRight: 30}],
			}}
			items={props.items}
			
		/>
		</View>
	);
}

function InlineView(props) {
	return(
		<View style={[{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}, props.style]}>
			{props.children}
		</View>
	);
}

export default styles;
export { FadeInView, MyText, MyTextInput, MyButton, MyAuthLinks, MyPicker, 
	InlineView, MyTabBar, GameLink, PoppingView, sizeDict };