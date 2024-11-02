import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import ScreenTitle from '../components/ScreenTitle';

const FollowScreen = ({ route }: { route: any }) => {
  const { type } = route.params;
  const [selectedTab, setSelectedTab] = useState(type);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/user/${selectedTab}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          if (selectedTab === 'followers') {
            setFollowers(data.followers);
          } 
          else {
            setFollowing(data.following);
          }
        } 
        else {
          Alert.alert('Error', data.message || 'Failed to load data');
        }
      } 
      catch (error) {
        Alert.alert('Error', 'An error occurred while fetching data');
      } 
      finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTab]);

  const renderUser = ({ item }: { item: { followerId: number; username: string } }) => (
    <View style={styles.userContainer}>
      <Text style={styles.username}>{item.username}</Text>
    </View>
  );

  return (
    <Background>
      <ScreenTitle title="Followers / Following" />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'followers' && styles.activeTab]}
          onPress={() => setSelectedTab('followers')}
        >
          <Text style={[styles.tabText, selectedTab === 'followers' && styles.activeTabText]}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'following' && styles.activeTab]}
          onPress={() => setSelectedTab('following')}
        >
          <Text style={[styles.tabText, selectedTab === 'following' && styles.activeTabText]}>Following</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={themeColors.yellow} />
      ) : (
        <FlatList
          data={selectedTab === 'followers' ? followers : following}
          keyExtractor={(item) => item.followerId.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </Background>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  activeTab: {
    borderBottomColor: themeColors.yellow,
  },
  tabText: {
    color: themeColors.textPrimary,
    fontSize: 18,
  },
  activeTabText: {
    color: themeColors.yellow,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.yellow,
  },
  username: {
    color: themeColors.textPrimary,
    fontSize: 16,
  },
});

export default FollowScreen;