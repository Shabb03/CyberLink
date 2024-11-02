import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import ScreenTitle from '../components/ScreenTitle';

const LoginScreen = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      } 
      else {
        await AsyncStorage.setItem('CyberLinkToken', data.token);
        await AsyncStorage.setItem('CyberLinkUsername', data.username);
        navigation.navigate('Home');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <ScreenTitle title="Login" />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={themeColors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={themeColors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={themeColors.yellow} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}
          <View style={styles.buttonSpacing} />
          <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.buttonText}>Go to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: themeColors.titleText,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: themeColors.yellow,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: themeColors.textSecondary,
    backgroundColor: themeColors.inputbg,
  },
  forgotText: {
    color: themeColors.textPrimary,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  buttonSpacing: {
    height: 10,
  },
  loginButton: {
    backgroundColor: themeColors.bgprimary,
    borderColor: themeColors.yellow,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: themeColors.bgsecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  signUpButton: {
    backgroundColor: themeColors.pinkButton,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: themeColors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: themeColors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;