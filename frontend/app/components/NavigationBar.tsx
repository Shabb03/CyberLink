import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import themeColors from '../colors/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const NavigationBar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color={themeColors.yellow} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Messages')}>
        <Icon name="message" size={24} color={themeColors.yellow} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CreatePost')}>
        <Icon name="add-circle" size={24} color={themeColors.yellow} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notifications')}>
        <Icon name="notifications" size={24} color={themeColors.yellow} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
        <Icon name="person" size={24} color={themeColors.yellow} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'black',
    borderTopWidth: 2,
    borderTopColor: themeColors.yellow,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    color: themeColors.yellow,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#FFD70080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  icon: {
    textShadowColor: '#FFD70080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default NavigationBar;