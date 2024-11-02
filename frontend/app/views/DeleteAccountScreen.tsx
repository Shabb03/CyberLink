import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import HeaderBar from '../components/HeaderBar';
import NavigationBar from '../components/NavigationBar';
import ScreenTitle from '../components/ScreenTitle';

const DeleteAccountScreen = ({ navigation }: { navigation: any }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      if (!token) {
        Alert.alert('Error', 'Unauthorized. Please log in again.');
        return;
      }
      const response = await fetch(`${BASE_URL}/api/account/deleteaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to delete account. Please try again.');
      } 
      else {
        Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
        navigation.navigate('Login');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the account. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <HeaderBar />
      <ScreenTitle title="Delete Account" />
      <View style={styles.container}>
        <Text style={styles.label}>Enter your password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={themeColors.textPrimary}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={loading}>
          <Text style={styles.deleteButtonText}>
            {loading ? 'Deleting Account...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>
      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    color: themeColors.yellow,
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: themeColors.inputbg,
    borderWidth: 2,
    borderColor: themeColors.bgsecondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: themeColors.textPrimary,
    fontSize: 16,
    marginBottom: 30,
  },
  deleteButton: {
    backgroundColor: themeColors.pinkButton,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: themeColors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeleteAccountScreen;