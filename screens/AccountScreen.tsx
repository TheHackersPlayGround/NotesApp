import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, TextInput, Button, Avatar, IconButton, Surface } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fetchUser, getProfileImageUri } from '@shared-api/postsApi';

// Import Bootstrap utilities
import { s, c } from '../styles/bootstrap';

export default function AccountScreen() {
  const { userId, fullname, email } = useLocalSearchParams();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(fullname as string);
  const [userEmail, setUserEmail] = useState(email as string);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [dbImagePath, setDbImagePath] = useState<string | null>(null);

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
      style={[s.flex1, s.bgLight]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.PRIMARY]} tintColor={c.PRIMARY} />}
    >
      {/* Cover Photo */}
      <View style={[s.bgPrimary, { height: 180 }]} />

      {/* Profile Header */}
      <View style={[s.alignItemsCenter, { marginTop: -60, marginBottom: 20 }]}>
        <Surface style={[s.bgWhite, s.shadow, { borderRadius: 75, padding: 5, position: 'relative' }]}>
          {avatarSource ? (
            <Avatar.Image size={120} source={avatarSource} />
          ) : (
            <Avatar.Text size={120} label={name?.substring(0, 2).toUpperCase()} style={s.bgPrimary} />
          )}
          {isEditing && (
            <IconButton icon="camera" mode="contained" style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e4e6eb' }} onPress={pickImage} />
          )}
        </Surface>
        <Text style={[s.h4, s.fontWeightBold, s.mt2, s.textDark]}>{name}</Text>
      </View>

      {/* Details Card */}
      <View style={[s.bgWhite, s.m3, s.p4, s.rounded, s.shadowSm]}>
        <View style={[s.flexRow, s.justifyContentBetween, s.alignItemsCenter, s.mb3]}>
          <Text style={[s.h4, s.fontWeightBold]}>Details</Text>
          <Button mode="text" onPress={() => setIsEditing(!isEditing)} textColor={c.PRIMARY}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </View>

        <View style={s.mb3}>
          <Text style={[{ fontSize: 14 }, s.fontWeightBold, s.textMuted, s.mb1]}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} mode="outlined" disabled={!isEditing} left={<TextInput.Icon icon="account" />} style={s.bgWhite} />
        </View>

        <View style={s.mb3}>
          <Text style={[{ fontSize: 14 }, s.fontWeightBold, s.textMuted, s.mb1]}>Email Address</Text>
          <TextInput value={userEmail} onChangeText={setUserEmail} mode="outlined" disabled={!isEditing} keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email" />} style={s.bgWhite} />
        </View>

        {isEditing && (
          <Button mode="contained" onPress={handleSave} loading={loading} style={[s.mt2, s.rounded]} buttonColor={c.PRIMARY}>
            Save Changes
          </Button>
        )}
      </View>

      <Button mode="outlined" onPress={() => router.back()} style={[s.mx3, s.mb4]} textColor={c.SECONDARY}>
        Go Back to Notes
      </Button>

      <View style={[s.alignItemsCenter, s.mb3, { paddingBottom: 20 }]}>
        <Text style={[{ fontSize: 10 }, s.textMuted]}>© 2026 All Rights Reserved</Text>
        <Text style={[{ fontSize: 11 }, s.textMuted, s.mt1]}>
          Developed by <Text style={[s.fontWeightBold, s.textPrimary]}>MeowsterChief</Text>
        </Text>
      </View>
    </ScrollView>
  );
}