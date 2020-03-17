import React from 'react'
import { Animated, Text, TextInput, TouchableHighlight, View, TouchableOpacity } from 'react-native';
import { RFPercentage } from "react-native-responsive-fontsize";
import RNPickerSelect from 'react-native-picker-select';


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
    backgroundColor: 'rgb(0, 139, 186)',
    borderColor: 'rgb(3, 99, 131)',
    borderWidth: RFPercentage(0.5),
    borderRadius: RFPercentage(1.5),
    alignItems: 'center',
    padding: '2%', margin: '1%',
  },

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
              borderRightWidth: 1, 
          }}>
            <MyText size={5} bold 
              color={isFocused ? 'black' : 'grey'} 
              style={{textAlign: 'center'}}>
                {label}</MyText>
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

function MyText(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  const color = props.color ? props.color : "black"
  return (
    <Text {...props} style={[{fontFamily: font, fontSize: sizeDict[hSize], color: color}, props.style]} >
      {props.children}
    </Text>
  );
}

function MyTextInput(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  const style = {
    backgroundColor: "white",
    borderColor: "black", 
    borderWidth: RFPercentage(0.5), 
    width: ("width" in props ? props.width : '100%'), 
    paddingLeft: '2%', paddingRight: '2%',
  };
  return (
    <TextInput autoCapitalize="none" autoCorrect={false} autoCompleteType="off" 
      {...props} style={[{fontFamily: font, fontSize: sizeDict[hSize]}, style, props.style]} 
    />
  );
}

function MyButton(props) {
  const hSize = props.size ? props.size : 4;
  return (
    <TouchableHighlight {...props} style={[styles.button, props.style]} underlayColor="rgb(70, 163, 194)" activeOpacity={0.5} >
      <MyText size={hSize} color="white" >{props.children}</MyText>
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
    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
      {props.children}
    </View>
  );
}

export default styles;
export { FadeInView, MyText, MyTextInput, MyButton, MyAuthLinks, MyPicker, 
  InlineView, MyTabBar, sizeDict };