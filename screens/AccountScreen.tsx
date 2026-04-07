import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native'; // 1. Import RefreshControl
import { Text, TextInput, Button, Avatar, IconButton, Surface } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fetchUser, getProfileImageUri } from '@shared-api/postsApi';

export default function AccountScreen() {
  const { userId, fullname, email } = useLocalSearchParams();
  
  // --- States ---
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(fullname as string);
  const [userEmail, setUserEmail] = useState(email as string);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 2. Add refreshing state
  
  const [image, setImage] = useState<string | null>(null);
  const [dbImagePath, setDbImagePath] = useState<string | null>(null);

  // 3. Move fetch logic to a named function
  const loadUserData = async () => {
    try {
      const data = await fetchUser(Number(userId));
      if (data.fullname) setName(data.fullname);
      if (data.email) setUserEmail(data.email);
      if (data.profile_image) setDbImagePath(data.profile_image);
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // 4. Create the onRefresh callback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [userId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, 
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('action', 'update_user');
    formData.append('user_id', userId.toString());
    formData.append('fullname', name);
    formData.append('email', userEmail);

    if (image) {
      // @ts-ignore
      formData.append('photo', { uri: image, name: 'profile.jpg', type: 'image/jpeg' });
    }

    try {
      const response = await fetch(`http://192.168.1.4/Api_AppMicarandayo/CORS.php`, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });
      const res = await response.json();
      if (response.ok) {
        if (res.image_path) setDbImagePath(res.image_path);
        setImage(null);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated! 📸");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const avatarSource = image ? { uri: image } : getProfileImageUri(dbImagePath);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={['#1877F2']} 
          tintColor={'#1877F2'}
        />
      }
    >
      <View style={styles.coverPhoto} />
      <View style={styles.profileHeader}>
        <Surface style={styles.avatarContainer} elevation={4}>
          {avatarSource ? (
            <Avatar.Image size={120} source={avatarSource} />
          ) : (
            <Avatar.Text size={120} label={name?.substring(0, 2).toUpperCase()} style={{ backgroundColor: '#1976D2' }} />
          )}
          {isEditing && (
            <IconButton icon="camera" mode="contained" style={styles.cameraIcon} onPress={pickImage} />
          )}
        </Surface>
        <Text variant="headlineMedium" style={styles.userName}>{name}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Details</Text>
          <Button mode="text" onPress={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} mode="outlined" disabled={!isEditing} left={<TextInput.Icon icon="account" />} style={styles.input} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput value={userEmail} onChangeText={setUserEmail} mode="outlined" disabled={!isEditing} keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email" />} style={styles.input} />
        </View>

        {isEditing && (
          <Button mode="contained" onPress={handleSave} loading={loading} style={styles.saveButton} buttonColor="#1877F2">
            Save Changes
          </Button>
        )}
      </View>

      <Button mode="outlined" onPress={() => router.back()} style={styles.backButton}>
        Go Back to Notes
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  coverPhoto: { height: 180, backgroundColor: '#0f55e3' },
  profileHeader: { alignItems: 'center', marginTop: -60, marginBottom: 20 },
  avatarContainer: { borderRadius: 75, padding: 5, backgroundColor: 'white', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e4e6eb' },
  userName: { fontWeight: 'bold', marginTop: 10, color: '#1c1e21' },
  infoSection: { backgroundColor: 'white', margin: 15, padding: 20, borderRadius: 10, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#65676b', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: 'white' },
  saveButton: { marginTop: 10, borderRadius: 6, paddingVertical: 5 },
  backButton: { marginHorizontal: 15, marginBottom: 30 },
});