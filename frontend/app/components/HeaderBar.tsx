import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import appConfig from '../../app.json'; 
import themeColors from '../colors/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HeaderBar = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.topBar}>
      <Text style={styles.textName}>{appConfig.appName}</Text>
      <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Search')}>
          <Icon name="search" size={24} color={themeColors.yellow} style={styles.searchIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: themeColors.yellow,
  },
  textName: {
    color: themeColors.titleText,
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00FFFF80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  searchButton: {
    padding: 10,
  },
  searchText: {
    color: themeColors.yellow,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#FFD70080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  searchIcon: {
    textShadowColor: '#FFD70080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default HeaderBar;