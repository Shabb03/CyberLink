import React from 'react';
import { Text, StyleSheet } from 'react-native';
import themeColors from '../colors/colors';

interface ScreenTitleProps {
  title: string;
}

const ScreenTitle: React.FC<ScreenTitleProps> = ({ title }) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: themeColors.titleText,
  },
});

export default ScreenTitle;
