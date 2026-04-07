import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { registerUser } from '@shared-api/postsApi';

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      
      <Text style={styles.title}>
        {displayedTitle}
        <Text style={{ color: '#08c2f6' }}>|</Text> 
      </Text>

      <Text variant="titleMedium" style={styles.subtitle}>
        Create an account to start
      </Text>

      <Animated.View entering={FadeInUp.duration(1000).delay(200)} style={styles.form}>
        <TextInput 
          label="Full Name" 
          value={name}
          onChangeText={setName}
          mode="outlined" 
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          theme={{ roundness: 12 }}
          cursorColor="#1976D2"
        />

        <TextInput 
          label="Email Address" 
          value={email}
          onChangeText={setEmail}
          mode="outlined" 
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          theme={{ roundness: 12 }}
          cursorColor="#1976D2"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput 
          label="Password" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass} 
          mode="outlined" 
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          theme={{ roundness: 12 }}
          cursorColor="#1976D2"
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
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          theme={{ roundness: 12 }}
          cursorColor="#1976D2"
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
          style={[styles.button, loading && styles.loadingButton]}
          loading={loading}
          disabled={loading}
          buttonColor="#1979d2"
          textColor="#FFFFFF"
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }} 
          contentStyle={{ height: 48 }}
        >
          {loading ? "Creating..." : "Create Account"}
        </Button>
        <View style={styles.loginLinkContainer}>
          <Text style={styles.alreadyText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 32, 
    backgroundColor: '#fefffe' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 40, 
    fontWeight: 'bold',
    color: '#08c2f6',
    fontSize: 42, 
    letterSpacing: 2, 
  },
  subtitle: { 
    textAlign: 'left', 
    marginBottom: 10,
    marginTop: -15,
    color: '#282727',
  },
  form: { gap: 12 },
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderWidth: 2, borderColor: 'rgba(147, 142, 142, 0.2)' },
  inputContent: { color: '#333' },
  button: { 
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
  },
  loadingButton: { opacity: 0.8 },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  alreadyText: { color: '#757575', fontSize: 14 },
  loginText: { color: '#08c2f6', fontSize: 14, fontWeight: 'bold' }
});