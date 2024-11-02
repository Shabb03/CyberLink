import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import themeColors from '../colors/colors';
import BASE_URL from '../config';
import Background from '../components/Background';
import HeaderBar from '../components/HeaderBar';
import NavigationBar from '../components/NavigationBar';
import ScreenTitle from '../components/ScreenTitle';

type BlockedUser = {
  id: string;
  username: string;
  profilePicture?: string;
};

const BlockedUsersScreen = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/follower/blocked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (response.ok) {
        setBlockedUsers(result.blockedUsers);
      } 
      else {
        Alert.alert('Error', result.message || 'Failed to load blocked users.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while fetching blocked users.');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/follower/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
        Alert.alert('Success', result.message);
      } 
      else {
        Alert.alert('Error', result.message || 'Failed to unblock user.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while unblocking the user.');
    }
  };

  const renderUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userContainer}>
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity style={styles.unblockButton} onPress={() => handleUnblock(item.id)}>
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Background>
      <HeaderBar />
      <ScreenTitle title="Blocked Users" />
      <View style={styles.container}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
  listContainer: {
    paddingBottom: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: themeColors.bgsecondary,
    borderWidth: 2,
  },
  username: {
    color: themeColors.yellow,
    fontSize: 18,
    fontWeight: 'bold',
  },
  unblockButton: {
    backgroundColor: themeColors.pinkButton,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  unblockText: {
    color: themeColors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: themeColors.yellow,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BlockedUsersScreen;