import React, { useEffect } from 'react'
import { Animated, Text, TextInput, TouchableHighlight } from 'react-native';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";


const styles = {
  loadingSocket: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      top: 0, bottom: 0, left: 0, right: 0,
      alignItems: 'center',
      justifyContent: 'center',
  },

  loadingImage: {width: '20%', height: '20%', resizeMode: 'contain' },

  loadingPage: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
    view: {
      flex: 1,
      alignItems: 'center', 
      paddingTop: '5%',
    },

    google: {
      width: '100%', 
      resizeMode: 'contain',
    },

    button: {
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
    padding: '2%', margin: '5%',
  },

};

const FadeInView = (props) => {
  const fadeValue = new Animated.Value(0); 

  React.useEffect(() => Animated.timing(fadeValue, { toValue: 1, duration: 1000 }).start(), []);

  return (
    <Animated.View style={[{flex: 1, opacity: fadeValue }, props.style]}>
      {props.children}
    </Animated.View>
  );
}

const sizeDict = {
  1: RFPercentage(6.5),
  2: RFPercentage(5.5),
  3: RFPercentage(4.5),
  4: RFPercentage(4),
  5: RFPercentage(3.5),
  6: RFPercentage(3),
};

function MyText(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  const color = props.color ? props.color : "black"
  return (
    <Text style={[{fontFamily: font, fontSize: sizeDict[hSize], color: color}, props.style]}>
      {props.children}
    </Text>
  );
}

function MyTextInput(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  const style = {
    borderColor: "black", 
    borderWidth: RFPercentage(0.5), 
    width: '100%', 
    paddingLeft: '2%', paddingRight: '2%',
  };
  return (
    <TextInput autoCapitalize="none" {...props} style={[{fontFamily: font, fontSize: sizeDict[hSize]}, style, props.style]} />
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

export default styles;
export { FadeInView, MyText, MyTextInput, MyButton };