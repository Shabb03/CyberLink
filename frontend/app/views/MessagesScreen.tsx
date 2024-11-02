import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import themeColors from '../colors/colors';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Messenger {
  messengerId: number;
  username: string;
  image: string;
}

const MessagesScreen = ({ route }: { route: any }) => {
  const navigation = useNavigation<NavigationProp>();
  const [messengers, setMessengers] = useState<Messenger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentUserId = route.params?.currentUserId;

  useEffect(() => {
    const fetchMessengers = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch('http://10.0.2.2:5094/api/message/messengers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setMessengers(data.message);
      } 
      catch (error) {
        Alert.alert('Error fetching messengers');
      } 
      finally {
        setLoading(false);
      }
    };

    fetchMessengers();
  }, []);

  const renderMessenger = ({ item }: { item: Messenger }) => {
    return (
      <TouchableOpacity
        style={styles.messengerContainer}
        onPress={() => navigation.navigate('Chat', { userId: currentUserId, receiverId: item.messengerId })}
      >
        <Image
          source={{ uri: `http://10.0.2.2:5094/images/${item.image}` }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#ff4da6" />
      ) : (
        <FlatList
          data={messengers}
          keyExtractor={(item) => item.messengerId.toString()}
          renderItem={renderMessenger}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  messengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2e2e2e',
    borderColor: '#00ffff',
    borderWidth: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ff4da6',
  },
  username: {
    marginLeft: 15,
    fontSize: 18,
    color: themeColors.textSecondary,
    fontWeight: 'bold',
    textShadowColor: '#ff4da6',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});