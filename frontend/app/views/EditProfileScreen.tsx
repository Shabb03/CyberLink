import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import * as ImagePicker from 'react-native-image-picker';
import { Asset } from 'react-native-image-picker';
import themeColors from '../colors/colors';
import Background from '../components/Background';
import ScreenTitle from '../components/ScreenTitle';

const defaultProfilePic = require('../images/default.jpg');

interface SelectedImage extends Partial<Asset> {
  uri?: string;
  type?: string;
  fileName?: string;
}

const EditProfileScreen = ({ navigation }: { navigation: any }) => {
  const [biography, setBiography] = useState("Bio here...");
  const [profilePic, setProfilePic] = useState<string>(defaultProfilePic); 
  const [image, setImage] = useState<SelectedImage | null>(null);

  const handleUpdateProfilePic = async () => {
    try {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
        },
        (result: ImagePicker.ImagePickerResponse) => {
          if (result.didCancel) {
            console.log('User cancelled image picker');
          } 
          else if (result.errorCode) {
            console.log('Image Picker Error: ', result.errorMessage);
          } 
          else if (result.assets && result.assets.length > 0) {
            const selectedImage = result.assets[0];
            if (selectedImage) {
              setImage({
                uri: selectedImage.uri,
                type: selectedImage.type,
                fileName: selectedImage.fileName || 'profile.jpg',
              });
              setProfilePic(selectedImage.uri || profilePic);
            }
          }
        }
      );
    } 
    catch (error) {
      Alert.alert('Error picking image');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('CyberLinkToken');
      if (!image?.uri) {
        Alert.alert('Error', 'Please select an image to upload.');
        return;
      }
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'profile.jpg',
      });

      const response = await fetch(`${BASE_URL}/api/user/editpicture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Profile picture updated successfully!');
      } 
      else {
        Alert.alert('Error', data.message || 'Failed to update profile picture');
      }
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  return (
    <Background>
      <ScreenTitle title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          <TouchableOpacity onPress={handleUpdateProfilePic} style={styles.changePicButton}>
            <Text style={styles.changePicText}>Change Profile Picture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.label}>Biography</Text>
          <TextInput
            style={styles.bioInput}
            value={biography}
            onChangeText={setBiography}
            multiline
            placeholder="Enter your bio here..."
            placeholderTextColor={themeColors.inputbg}
          />
        </View>

        <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePicContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: themeColors.yellow,
    borderWidth: 3,
    backgroundColor: 'black',
  },
  changePicButton: {
    marginTop: 10,
    backgroundColor: themeColors.bgsecondary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  changePicText: {
    color: themeColors.yellow,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioContainer: {
    width: '90%',
    marginBottom: 40,
  },
  label: {
    color: themeColors.yellow,
    fontSize: 18,
    marginBottom: 10,
  },
  bioInput: {
    backgroundColor: themeColors.inputbg,
    borderColor: themeColors.yellow,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: themeColors.textPrimary,
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: themeColors.bgsecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  saveButton: {
    backgroundColor: themeColors.bgsecondary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: themeColors.yellow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: themeColors.yellow,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;