import React, { useEffect } from 'react'
import { Animated } from 'react-native';
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
      fontWeight: 'bold'
    }
  }

};

const FadeInView = (props) => {
  const fadeValue = new Animated.Value(0); 

  React.useEffect(() => Animated.timing(fadeValue, { toValue: 1, duration: 1000 }).start(), []);

  return (
    <Animated.View style={{flex: 1, opacity: fadeValue }}>
      {props.children}
    </Animated.View>
  );
}

export default styles;
export { FadeInView };