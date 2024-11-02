import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './app/views/HomeScreen';
import LoginScreen from './app/views/LoginScreen';
import SignUpScreen from './app/views/SignUpScreen';
import BlockedUsersScreen from './app/views/BlockedUsersScreen';
import ChangePasswordScreen from './app/views/ChangePasswordScreen';
import ChatScreen from './app/views/ChatScreen';
import CommentsScreen from './app/views/CommentsScreen';
import CreatePostScreen from './app/views/CreatePostScreen';
import DeleteAccountScreen from './app/views/DeleteAccountScreen';
import EditProfileScreen from './app/views/EditProfileScreen';
import FollowScreen from './app/views/FollowScreen';
import MessagesScreen from './app/views/MessagesScreen';
import NotificationsScreen from './app/views/NotificationsScreen';
import PostScreen from './app/views/PostScreen';
import ProfileScreen from './app/views/ProfileScreen';
import SearchScreen from './app/views/SearchScreen';
import SettingsScreen from './app/views/SettingsScreen';
import UserProfileScreen from './app/views/UserProfileScreen';

import { RootStackParamList } from './app/types';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        if (token === null || token === "") {
          setInitialRoute('Login');
        } 
        else {
          setInitialRoute('Home');
        }
      } 
      catch (error) {
        console.error('Error reading token from AsyncStorage:', error);
        setInitialRoute('Login');
      }
      finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Comments" component={CommentsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Follow" component={FollowScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;