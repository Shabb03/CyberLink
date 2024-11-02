import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import NavigationBar from '../components/NavigationBar';
import HeaderBar from '../components/HeaderBar';
import ScreenTitle from '../components/ScreenTitle';

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  return (
    <Background>
      <HeaderBar />
      <ScreenTitle title="Settings" />
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BlockedUsers')}>
          <Text style={styles.buttonText}>Blocked Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await AsyncStorage.removeItem('CyberLinkToken');
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    marginVertical: 10,
    width: '80%',
    paddingVertical: 15,
    backgroundColor: themeColors.bgprimary,
    borderColor: themeColors.yellow,
    borderWidth: 2,
    transform: [{ skewX: '-20deg' }],
    shadowColor: themeColors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    color: themeColors.yellow,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    transform: [{ skewX: '20deg' }],
  },
});

export default SettingsScreen;