import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import HeaderBar from '../components/HeaderBar';
import NavigationBar from '../components/NavigationBar';
import ScreenTitle from '../components/ScreenTitle';

const defaultProfilePic = require('../images/default.jpg');

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/user/myprofile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setUserProfile(data.userProfile);
        } 
        else {
          setError(data.message || 'Failed to load profile');
        }
      } 
      catch (err) {
        setError('An error occurred while fetching the profile');
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePostPress = (postId: number, postInfo: any) => {
    navigation.navigate('Post', { postId, postInfo });
  };

  const renderPost = ({ item }: { item: { id: number; content: string; image: string } }) => (
    <TouchableOpacity onPress={() => handlePostPress(item.id, item)}>
      <View style={styles.postContainer}>
        <Image source={{ uri: `http://10.0.2.2:5094/api/image/getimage/${item.image}` }} style={styles.postImage} />
        <Text style={styles.postText}>{item.content}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <Background>
        <ActivityIndicator size="large" color={themeColors.yellow} />
      </Background>
    );
  }

  if (error) {
    return (
      <Background>
        <Text style={styles.errorText}>{error}</Text>
      </Background>
    );
  }

  return (
    <Background>
      <HeaderBar />
      <ScreenTitle title="Profile" />
      
      <View style={styles.header}>
        <Text style={styles.username}>{userProfile?.username}</Text>
        <TouchableOpacity style={styles.settingsIcon} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
      <Image source={userProfile?.profilePicture ? { uri: `${BASE_URL}/api/image/getimage/${userProfile.profilePicture}` } : defaultProfilePic} style={styles.profilePicture} />
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userProfile?.postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Follow', { type: 'followers' })}>
            <Text style={styles.statNumber}>{userProfile?.followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Follow', { type: 'following' })}>
            <Text style={styles.statNumber}>{userProfile?.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userProfile?.posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
        numColumns={2}
      />

      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  settingsIcon: {
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 20,
    shadowColor: themeColors.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  settingsText: {
    color: themeColors.yellow,
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: themeColors.yellow,
    marginBottom: 10,
  },
  username: {
    color: themeColors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: themeColors.yellow,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: themeColors.textPrimary,
    fontSize: 14,
  },
  editProfileButton: {
    backgroundColor: themeColors.yellow,
    borderColor: themeColors.yellow,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  editProfileText: {
    color: themeColors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsList: {
    paddingHorizontal: 10,
  },
  postContainer: {
    flex: 1,
    margin: 5,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderColor: themeColors.yellow,
    borderWidth: 1,
  },
  postText: {
    color: themeColors.textPrimary,
    textAlign: 'center',
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    color: themeColors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;