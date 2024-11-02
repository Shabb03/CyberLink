import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';

const defaultProfilePic = require('../images/default.jpg');

interface Comment {
  id: number;
  content: string;
  username: string;
  image: string;
  userId: number;
}

const CommentsScreen = ({ route }: { route: any }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(Number(id));
    };

    fetchUserData();
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/post/comments/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      } 
      else {
        Alert.alert('Error', data.message || 'Failed to load comments.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to load comments.');
    }
  };

  const handleAddComment = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/comment/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, message: newComment }),
      });
      const data = await response.json();

      if (userId === null) {
        Alert.alert('Error', 'User is not logged in.');
        return;
      }

      if (response.ok) {
        setComments(prevComments => [
          ...prevComments,
          { id: data.commentId, content: newComment, username: 'You', image: defaultProfilePic, userId },
        ]);
        setNewComment('');
      } 
      else {
        Alert.alert('Error', data.message || 'Failed to add comment.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/comment/editcomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId, message: content }),
      });
      const data = await response.json();

      if (response.ok) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId ? { ...comment, content } : comment
          )
        );
      } 
      else {
        Alert.alert('Error', data.message || 'Failed to update comment.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/comment/deletecomment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      });
      const data = await response.json();

      if (response.ok) {
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      } 
      else {
        Alert.alert('Error', data.message || 'Failed to delete comment.');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to delete comment.');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: `${BASE_URL}/api/image/getimage/${item.image}` }}
        style={styles.commentImage}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
        {userId === item.userId && (
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleEditComment(item.id, item.content)}>
              <Text style={styles.commentActionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
              <Text style={styles.commentActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Background>
      <View style={styles.container}>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          contentContainerStyle={styles.listContainer}
        />
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.addCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor={themeColors.textPrimary}
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity style={styles.addCommentButton} onPress={handleAddComment}>
            <Text style={styles.addCommentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.bgprimary,
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
    backgroundColor: themeColors.inputbg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColors.yellow,
  },
  commentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  commentContent: {
    flex: 1,
    justifyContent: 'center',
  },
  commentUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.yellow,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: themeColors.textPrimary,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  commentActionText: {
    marginRight: 15,
    color: themeColors.yellow,
    fontWeight: 'bold',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  addCommentInput: {
    flex: 1,
    backgroundColor: themeColors.inputbg,
    borderRadius: 8,
    padding: 10,
    color: themeColors.textPrimary,
  },
  addCommentButton: {
    backgroundColor: themeColors.pinkButton,
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  addCommentButtonText: {
    color: themeColors.textSecondary,
    fontWeight: 'bold',
  },
});

export default CommentsScreen;