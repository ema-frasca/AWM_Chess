import React, { useEffect } from 'react'
import { Animated, Text, TextInput } from 'react-native';
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
      paddingTop: '10%',
    },

    google: {
      width: '100%', 
      resizeMode: 'contain',
    }

  }

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
  1: RFPercentage(5),
  2: RFPercentage(4.2),
  3: RFPercentage(3.7),
  4: RFPercentage(3),
  5: RFPercentage(2.5),
  6: RFPercentage(2),
};

function MyText(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  return (
    <Text style={[{fontFamily: font, fontSize: sizeDict[hSize]}, props.style]}>
      {props.children}
    </Text>
  );
}

function MyTextInput(props) {
  const font = props.bold ? 'comic-sans-bold' : 'comic-sans';
  const hSize = props.size ? props.size : 4;
  const style = {borderColor: "black", borderWidth: RFPercentage(0.5), width: '100%'}
  return (
    <TextInput {...props} style={[{fontFamily: font, fontSize: sizeDict[hSize]}, style, props.style]} />
  );
}

export default styles;
export { FadeInView, MyText, MyTextInput };