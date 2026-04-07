import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { loginUser } from '@shared-api/postsApi';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const fullTitle = "WELCOME";

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: any; 

    const typeLoop = () => {
      setDisplayedTitle(fullTitle.slice(0, currentIndex));
      let speed = isDeleting ? 50 : 150;
      
      if (!isDeleting && currentIndex === fullTitle.length) { 
        speed = 1500; 
        isDeleting = true; 
      } else if (isDeleting && currentIndex === 0) { 
        isDeleting = false; 
        speed = 500; 
      }
      
      currentIndex = isDeleting ? currentIndex - 1 : currentIndex + 1;
      
      timeoutId = setTimeout(typeLoop, speed);
    };

    typeLoop();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      
      router.replace({
        pathname: '/home',
        params: { 
          userId: response.user.id, 
          fullname: response.user.fullname,
          email: email 
        }
      });
      
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.title}>{displayedTitle}<Text style={{ color: '#08c2f6' }}>|</Text></Text>
        <Text variant="titleMedium" style={styles.subtitle}>Sign in to continue</Text>
        
        <Animated.View entering={FadeInUp.duration(1000).delay(300)} style={styles.form}>
          <TextInput 
            label="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            mode="outlined" 
            style={styles.input} 
            theme={{ roundness: 12 }} 
            autoCapitalize="none" 
            keyboardType="email-address" 
          />
          
          <TextInput 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={!showPassword} 
            mode="outlined" 
            style={styles.input} 
            theme={{ roundness: 12 }} 
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)} 
              />
            } 
          />
          
          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading} 
            style={styles.button} 
            buttonColor="#1979d2"
          >
            Login
          </Button>
          
          <View style={styles.signupContainer}>
            <Text style={{ color: '#757575' }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('./register')}>
              <Text style={styles.signupText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>All Rights Reserved 2026</Text>
        <Text style={styles.developerText}>
          Developed by <Text style={styles.developerName}>MeowsterChief</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fefffe' 
  },
  mainContent: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 32 
  },
  title: { textAlign: 'center', marginBottom: 48, fontWeight: 'bold', color: '#08c2f6', fontSize: 42 },
  subtitle: { marginBottom: 10, marginTop: -15, color: '#282727', textAlign: 'center' },
  form: { gap: 15 },
  input: { backgroundColor: 'transparent' },
  button: { marginTop: 5, borderRadius: 12 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText: { color: '#08c2f6', fontWeight: 'bold' },
  
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  developerText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  developerName: {
    fontWeight: 'bold',
    color: '#08c2f6',
  }
});