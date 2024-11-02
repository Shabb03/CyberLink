import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import themeColors from '../colors/colors';

type BackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

const Background: React.FC<BackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
       colors={[themeColors.bgsecondary, themeColors.bgprimary]}
       start={{ x: 0.1, y: 0.1 }}
       locations={[0, 0.3]}
       style={styles.background}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default Background;