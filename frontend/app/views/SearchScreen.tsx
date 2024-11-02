import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import NavigationBar from '../components/NavigationBar';
import SearchBar from '../components/SearchBar';

const SearchScreen = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setLoading(true);

      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const response = await fetch(`${BASE_URL}/api/follower/searchuser/${searchQuery}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSearchResults(data.users);
        } 
        else {
          Alert.alert('Error fetching search results');
          setSearchResults([]);
        }
      } 
      catch (error) {
        Alert.alert('Error fetching search results');
        setSearchResults([]);
      } 
      finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleUserPress = async (username: string) => {
    const myUsername = await AsyncStorage.getItem('CyberLinkUsername');
    if (username === myUsername) {
      navigation.navigate('Profile');
    }
    else {
      navigation.navigate('UserProfile', { username });
    }
  };

  const renderUserItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)} style={styles.userItem}>
      <Text style={styles.username}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Background>
      <View style={styles.container}>
        <SearchBar onSearch={handleSearch} />
        <Text style={styles.queryText}>Searching for: {searchQuery}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={themeColors.yellow} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item}
            renderItem={renderUserItem}
            ListEmptyComponent={<Text style={styles.noResults}>No users found</Text>}
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
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  queryText: {
    fontSize: 20,
    marginTop: 10,
    color: themeColors.yellow,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: themeColors.textPrimary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  userItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: themeColors.bgprimary,
    borderRadius: 8,
    borderColor: themeColors.yellow,
    borderWidth: 1,
    shadowColor: themeColors.yellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  username: {
    fontSize: 18,
    color: themeColors.yellow,
    fontWeight: 'bold',
    textShadowColor: themeColors.textPrimary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noResults: {
    fontSize: 18,
    color: themeColors.pinkButton,
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: themeColors.textPrimary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default SearchScreen;