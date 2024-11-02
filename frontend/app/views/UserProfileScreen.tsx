import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import HeaderBar from '../components/HeaderBar';
import NavigationBar from '../components/NavigationBar';

const defaultProfilePic = require('../images/default.jpg');

const UserProfileScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { username } = route.params;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/follower/user/${username}`, {
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
          Alert.alert('Error fetching user profile');
        }
      } 
      catch (error) {
        Alert.alert('Error fetching user profile');
      } 
      finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleFollowUnfollow = async () => {
    if (userProfile) {
      try {
        const url = userProfile.isFollowing ? 'unfollow' : 'follow';
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/follower/${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userProfile.id }),
        });

        const data = await response.json();
        if (response.ok) {
          setUserProfile((prevProfile: any) => ({
            ...prevProfile,
            isFollowing: !prevProfile.isFollowing,
          }));
          Alert.alert(data.message);
        } 
        else {
          Alert.alert('Error updating user following status');
        }
      } 
      catch (error) {
        Alert.alert('Error updating user following status');
      }
    }
  };

  const handleBlockUser = async () => {
    if (userProfile) {
      try {
        const url = userProfile.isBlocked ? 'unblock' : 'block';
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/follower/${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userProfile.id }),
        });

        const data = await response.json();
        if (response.ok) {
          setUserProfile((prevProfile: any) => ({
            ...prevProfile,
            isBlocked: !prevProfile.isBlocked,
          }));
          Alert.alert(data.message);
        } 
        else {
          Alert.alert('Error updating user blocking status');
        }
      } 
      catch (error) {
        Alert.alert('Error updating user blocking status');
      }
    }
  };

  const handlePostPress = (postId: number, postInfo: any) => {
    navigation.navigate('Post', { postId, postInfo });
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handlePostPress(item.Id, item)}>
      <View style={styles.post}>
        <Image source={{ uri: `${BASE_URL}/api/image/getimage/${item.image}` }} style={styles.postImage} />
        <Text style={styles.postText}>{item.content}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Background>
        <HeaderBar />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.yellow} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
        <NavigationBar />
      </Background>
    );
  }

  if (!userProfile) {
    return (
      <Background>
        <HeaderBar />
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
        <NavigationBar />
      </Background>
    );
  }

  return (
    <Background>
      <HeaderBar />
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={userProfile?.profilePicture ? { uri: `${BASE_URL}/api/image/getimage/${userProfile.profilePicture}` } : defaultProfilePic} style={styles.profileImage}/>
          <Text style={styles.username}>{userProfile.username}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userProfile.postCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userProfile.followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userProfile.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={userProfile.isFollowing ? 'Unfollow' : 'Follow'}
            onPress={handleFollowUnfollow}
            color={themeColors.yellow}
          />
          <Button
            title={userProfile.isBlocked ? 'Unblock' : 'Block'}
            onPress={handleBlockUser}
            color={themeColors.error}
          />
        </View>
        <FlatList
          data={userProfile.posts}
          renderItem={renderPost}
          contentContainerStyle={styles.postList}
        />
      </View>
      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: themeColors.yellow,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.yellow,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.yellow,
  },
  statLabel: {
    fontSize: 14,
    color: themeColors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  postList: {
    paddingBottom: 20,
  },
  post: {
    marginBottom: 20,
    backgroundColor: themeColors.bgprimary,
    padding: 10,
    borderRadius: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  postText: {
    color: themeColors.yellow,
    fontSize: 16,
    marginTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeColors.yellow,
  },
  errorText: {
    fontSize: 18,
    color: themeColors.error,
  },
});

export default UserProfileScreen;