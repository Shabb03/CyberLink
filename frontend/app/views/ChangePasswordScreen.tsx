import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import HeaderBar from '../components/HeaderBar';
import NavigationBar from '../components/NavigationBar';
import ScreenTitle from '../components/ScreenTitle';
import BASE_URL from '../config';

const ChangePasswordScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const getOtp = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/account/passwordotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      response.ok
        ? Alert.alert('OTP Sent', 'Please check your email for the OTP.')
        : Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while sending OTP. Please try again.');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordChangeLoading(true);
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/account/changepassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          newPassword: password,
        }),
      });
      const data = await response.json();
      response.ok
        ? (Alert.alert('Password Changed', 'Your password has been updated successfully.'),
          navigation.navigate('Login'))
        : Alert.alert('Error', data.message || 'Failed to change the password. Please try again.');
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while changing the password. Please try again.');
    } 
    finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <Background>
      <HeaderBar />
      <ScreenTitle title="Change Password" />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={themeColors.yellow}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={getOtp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="OTP"
          placeholderTextColor={themeColors.yellow}
          value={otp}
          onChangeText={setOtp}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={themeColors.yellow}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={passwordChangeLoading}
        >
          <Text style={styles.buttonText}>
            {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    width: '85%',
    borderColor: themeColors.yellow,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: themeColors.bgprimary,
    color: themeColors.yellow,
  },
  button: {
    width: '85%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.bgprimary,
    borderColor: themeColors.yellow,
    borderWidth: 2,
    marginVertical: 10,
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
    transform: [{ skewX: '20deg' }],
  },
});

export default ChangePasswordScreen;