import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import BASE_URL from '../config';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import ScreenTitle from '../components/ScreenTitle';

const CreatePostScreen = ({ navigation }: { navigation: any }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Cancelled', 'User cancelled image picker');
        } 
        else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Unknown error');
        } 
        else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setPhotoUri(asset.uri || null);
          setPhotoName(asset.fileName || 'photo.jpg');
        }
      }
    );
  };

  const savePost = async () => {
    if (!photoUri || !photoName) {
      Alert.alert('Error', 'Please take or select a photo first');
      return;
    }

    if (!message) {
      Alert.alert('Error', 'Please add a caption for your post');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        name: photoName,
        type: 'image/jpeg',
      });
      formData.append('imageName', photoName);
      formData.append('content', message);

      const response = await axios.post(`${BASE_URL}/api/userpost/addpost`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Post added successfully');
        setPhotoUri(null);
        setMessage('');
        navigation.goBack();
      } 
      else {
        Alert.alert('Error', response.data.message || 'Failed to add post');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'An error occurred while saving the post');
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScreenTitle title="Add New Post" />
        <ScrollView contentContainerStyle={styles.content}>
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
              <Icon name="camera-alt" size={40} color={themeColors.pinkButton} />
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            placeholder="Write a caption..."
            placeholderTextColor={themeColors.yellow}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          {photoUri && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={savePost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.yellow} />
              ) : (
                <Text style={styles.saveButtonText}>+</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    marginBottom: 10,
    borderRadius: 15,
    borderColor: themeColors.textPrimary,
    borderWidth: 2,
  },
  input: {
    width: '100%',
    borderColor: themeColors.cyberMagenta,
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    textAlignVertical: 'top',
    height: 100,
    color: themeColors.textPrimary,
    backgroundColor: themeColors.inputbg,
  },
  retakeButton: {
    backgroundColor: themeColors.bgprimary,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderColor: themeColors.pinkButton,
    borderWidth: 1,
  },
  retakeText: {
    color: themeColors.pinkButton,
    fontWeight: 'bold',
  },
  cameraButton: {
    backgroundColor: themeColors.bgprimary,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    borderColor: themeColors.pinkButton,
    borderWidth: 1,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: themeColors.pinkButton,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: themeColors.pinkButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  saveButtonText: {
    color: themeColors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CreatePostScreen;