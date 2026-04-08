import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { registerUser } from '@shared-api/postsApi';

import { s, c } from '../styles/bootstrap';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [displayedTitle, setDisplayedTitle] = useState('');
  const fullTitle = "JOIN US";

  useEffect(() => {
    let timeout: any; 
    let currentIndex = 0;
    let isDeleting = false;

    const typeLoop = () => {
      setDisplayedTitle(fullTitle.slice(0, currentIndex));
      let speed = isDeleting ? 50 : 150; 

      if (!isDeleting && currentIndex === fullTitle.length) {
        speed = 2000; 
        isDeleting = true;
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        speed = 500;
      }

      currentIndex = isDeleting ? currentIndex - 1 : currentIndex + 1;
      timeout = setTimeout(typeLoop, speed);
    };

    typeLoop();
    return () => clearTimeout(timeout);
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.flex1, s.bgWhite]}>
      <ScrollView 
        contentContainerStyle={[s.justifyContentCenter, s.p4, { flexGrow: 1 }]} 
        keyboardShouldPersistTaps="handled"
      >
        
        <Text style={[s.textCenter, s.mb4, s.fontWeightBold, s.textPrimary, { fontSize: 42 }]}>
          {displayedTitle}
          <Text style={{ color: c.INFO }}>|</Text> 
        </Text>

        <Text style={[s.textCenter, s.textDark, s.mb3, { marginTop: -25, fontSize: 16 }]}>
          Create an account to start
        </Text>

        <Animated.View entering={FadeInUp.duration(1000).delay(200)}>
          <View style={{ gap: 12 }}>
            <TextInput 
              label="Full Name" 
              value={name}
              onChangeText={setName}
              mode="outlined" 
              style={s.bgWhite}
              theme={{ roundness: 12 }}
              cursorColor={c.PRIMARY}
            />

            <TextInput 
              label="Email Address" 
              value={email}
              onChangeText={setEmail}
              mode="outlined" 
              style={s.bgWhite}
              theme={{ roundness: 12 }}
              cursorColor={c.PRIMARY}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput 
              label="Password" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass} 
              mode="outlined" 
              style={s.bgWhite}
              theme={{ roundness: 12 }}
              cursorColor={c.PRIMARY}
              right={
                <TextInput.Icon 
                  icon={showPass ? "eye-off" : "eye"} 
                  onPress={() => setShowPass(!showPass)} 
                />
              }
            />

            <TextInput 
              label="Confirm Password" 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm} 
              mode="outlined" 
              style={s.bgWhite}
              theme={{ roundness: 12 }}
              cursorColor={c.PRIMARY}
              right={
                <TextInput.Icon 
                  icon={showConfirm ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirm(!showConfirm)} 
                />
              }
            />
            
            <Button 
              mode="contained" 
              onPress={handleRegister}
              style={[s.mt3, s.rounded]}
              loading={loading}
              disabled={loading}
              buttonColor={c.PRIMARY}
              labelStyle={[s.fontWeightBold, { fontSize: 16 }]} 
              contentStyle={{ height: 48 }}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>

            <View style={[s.flexRow, s.justifyContentCenter, s.mt3]}>
              <Text style={s.textMuted}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[s.textPrimary, s.fontWeightBold]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Footer Branding inside ScrollView to ensure it moves with keyboard if needed */}
        <View style={[s.alignItemsCenter, s.mt5, { paddingBottom: 20 }]}>
          <Text style={[{ fontSize: 12 }, s.textMuted]}>All Rights Reserved 2026</Text>
          <Text style={[{ fontSize: 12 }, s.textMuted, s.mt1]}>
            Developed by <Text style={[s.fontWeightBold, s.textPrimary]}>Neil Micarandayo</Text>
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}