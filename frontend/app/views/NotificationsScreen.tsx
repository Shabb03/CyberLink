import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import NavigationBar from '../components/NavigationBar';
import ScreenTitle from '../components/ScreenTitle';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/user/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setNotifications(data.notifications);
        } 
        else {
          setError(data.message || 'Failed to load notifications');
        }
      } 
      catch (err) {
        setError('An error occurred while fetching notifications');
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }: { item: { id: number; message: string; time: string } }) => (
    <View style={styles.notificationContainer}>
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
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
      <ScreenTitle title="Notifications" />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
      />
      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  notificationContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.yellow,
  },
  notificationText: {
    color: themeColors.textPrimary,
    fontSize: 16,
  },
  timeText: {
    color: themeColors.textPrimary,
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    color: themeColors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationsScreen;