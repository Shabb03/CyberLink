import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PostScreen = ({ route }: { route: any }) => {
  const navigation = useNavigation<NavigationProp>();
  const { postId } = route.params;

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editedContent, setEditedContent] = useState(''); 
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = await AsyncStorage.getItem('CyberLinkToken');
        const currentUsername = await AsyncStorage.getItem('CyberLinkUsername');
        setUsername(currentUsername || '');

        const response = await fetch(`${BASE_URL}/api/post/posts/${postId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          const imageUrl = `${BASE_URL}/api/image/getimage/${data.post.imageName}`;
          setPost({ ...data.post, image: imageUrl });
          setEditedContent(data.post.content);
          setIsLoading(false);
        } 
        else {
          setError(data.message || 'Failed to load post');
          setIsLoading(false);
        }
      } 
      catch (err) {
        setError('An error occurred while fetching the post');
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/userpost/editpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, content: editedContent }),
      });
      const data = await response.json();

      if (response.ok) {
        setPost((prev: any) => ({ ...prev, content: editedContent }));
        setIsEditing(false);
      } 
      else {
        Alert.alert('Error', 'An error occurred while editing the post. Please try again.');
      }
    } 
    catch (err) {
      Alert.alert('Error', 'An error occurred while editing the post. Please try again.');
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      const response = await fetch(`${BASE_URL}/api/userpost/deletepost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
      const data = await response.json();

      if (response.ok) {
        navigation.goBack();
      } 
      else {
        Alert.alert('Error', 'An error occurred while deleting the post. Please try again.');
      }
    } 
    catch (err) {
      Alert.alert('Error', 'An error occurred while deleting the post. Please try again.');
    }
  };

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
      <View style={styles.container}>
        <Text style={styles.username}>{post.username}</Text>
        <Image source={{ uri: post.image }} style={styles.postImage} />
        
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            multiline
            value={editedContent}
            onChangeText={setEditedContent}
          />
        ) : (
          <Text style={styles.contentText}>{post.content}</Text>
        )}

        {post.username === username && (
          <View style={styles.editOptions}>
            {isEditing ? (
              <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleDeletePost} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>♥ {post.likeCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.yellow,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    color: themeColors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  textInput: {
    fontSize: 16,
    color: themeColors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: themeColors.yellow,
    padding: 10,
    borderRadius: 5,
  },
  editOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  editButton: {
    padding: 10,
    backgroundColor: themeColors.yellow,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 10,
    backgroundColor: themeColors.yellow,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: themeColors.error,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: themeColors.textPrimary,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  errorText: {
    fontSize: 18,
    color: themeColors.error,
    textAlign: 'center',
  },
});

export default PostScreen;