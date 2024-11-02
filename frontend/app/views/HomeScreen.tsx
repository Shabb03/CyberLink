import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import NavigationBar from '../components/NavigationBar';
import HeaderBar from '../components/HeaderBar';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/post/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const updatedPosts = data.posts.map((post: any) => ({
        ...post,
        image: `http://10.0.2.2:5094/api/image/getimage/${post.image}`
      }));
      setPosts(updatedPosts);
    } 
    catch (error) {
      Alert.alert('Error retrieving posts');
    } 
    finally {
      setLoading(false);
    }
  };

  const toggleLikePost = async (postId: number, isLiked: boolean) => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/post/${isLiked ? 'unlikepost' : 'likepost'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ postId }),
        }
      );
      const data = await response.json();
      fetchPosts();
    } 
    catch (error) {
      Alert.alert('Error liking post');
    }
  };

  const toggleBookmarkPost = async (postId: number, isBookmarked: boolean) => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/post/${isBookmarked ? 'unbookmarkpost' : 'bookmarkpost'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ postId }),
        }
      );
      const data = await response.json();
      fetchPosts();
    } 
    catch (error) {
      Alert.alert('Error bookmarking post');
    }
  };

  const handleLikeToggle = (postId: number, isLiked: boolean) => {
    toggleLikePost(postId, isLiked);
  };

  const handleBookmarkToggle = (postId: number, isBookmarked: boolean) => {
    toggleBookmarkPost(postId, isBookmarked);
  };

  const handlePostPress = (post: any) => {
    navigation.navigate('Post', { postId: post.id, postInfo: post });
  };

  const handleCommentsPress = (postId: number) => {
    navigation.navigate('Comments', { postId });
  };

  const fetchStories = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/story/viewstory`);
      const data = await response.json();
      setStories(data.stories);
    } 
    catch (error) {
      Alert.alert('Error retrieving stories');
    }
  };

  const renderStory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.storyContainer}>
      <Image source={{ uri: `http://10.0.2.2:5094/api/image/getimage/${item.image}` }} style={styles.storyImage} />
      <Text style={styles.storyUsername}>{item.username}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
      </View>

      <TouchableOpacity onPress={() => handlePostPress(item)}>
        <Image source={{ uri: `http://10.0.2.2:5094/api/image/getimage/${item.image}` }} style={styles.postImage} />
      </TouchableOpacity>
      <Text style={styles.contentText}>{item.content}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => handleLikeToggle(item.id, item.isLiked)}
          style={styles.actionButton}
        >
          <Text
            style={[styles.actionText, item.isLiked ? styles.likedText : styles.unlikedText]}
          >
            {item.isLiked ? '♥' : '♡'} {item.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCommentsPress(item.id)}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>💬 {item.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBookmarkToggle(item.id, item.isBookmarked)}
          style={styles.actionButton}
        >
          <Text
            style={[
              styles.actionText,
              item.isBookmarked ? styles.bookmarkedText : styles.unbookmarkedText,
            ]}
          >
            {item.isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Background>
        <ActivityIndicator
          size="large"
          color={themeColors.yellow}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
      </Background>
    );
  }

  return (
    <Background>
      <HeaderBar />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
        {stories.map((story) => (
          <View key={story.id}>
            {renderStory({ item: story })}
          </View>
        ))}
      </ScrollView>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={styles.listContainer}
      />
      <NavigationBar />
    </Background>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  postContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: themeColors.bgprimary,
    borderRadius: 10,
    borderColor: themeColors.yellow,
    borderWidth: 2,
  },
  postHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.yellow,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: themeColors.bgsecondary,
  },
  contentText: {
    fontSize: 16,
    color: themeColors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.yellow,
  },
  likedText: {
    color: themeColors.pinkButton,
  },
  unlikedText: {
    color: themeColors.yellow,
  },
  bookmarkedText: {
    color: themeColors.yellow,
  },
  unbookmarkedText: {
    color: themeColors.textPrimary,
  },
  storiesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: themeColors.bgsecondary,
    borderBottomWidth: 2,
    borderBottomColor: themeColors.yellow,
    marginBottom: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: themeColors.pinkButton,
  },
  storyUsername: {
    color: themeColors.yellow,
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
    textShadowColor: '#FFD70080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default HomeScreen;