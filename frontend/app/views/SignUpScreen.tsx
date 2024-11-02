import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import ScreenTitle from '../components/ScreenTitle';

const SignUpScreen = ({navigation}: {navigation: any}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/account/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Sign-Up Failed', data.message || 'An error occurred during sign-up.');
      } 
      else {
        Alert.alert('Sign-Up Successful', 'You have successfully registered! Please login.');
        navigation.navigate('Login');
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
      <ScreenTitle title="Sign Up" />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor={themeColors.textSecondary}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor={themeColors.textSecondary}
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={themeColors.textSecondary}
          value={username}
          onChangeText={setUsername}
        />
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
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={themeColors.yellow} />
          ) : (
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          )}
          <View style={styles.buttonSpacing} />
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Go to Login</Text>
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
    color: themeColors.textPrimary,
    backgroundColor: themeColors.inputbg,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  buttonSpacing: {
    height: 10,
  },
  signUpButton: {
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
  loginButton: {
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

export default SignUpScreen;