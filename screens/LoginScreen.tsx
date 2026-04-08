import { loginUser } from '@shared-api/postsApi';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Import Bootstrap utilities
import { c, s } from '../styles/bootstrap';

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
    <View style={[s.flex1, s.bgWhite]}>
      {/* Main Content Area - Bootstrap Center Alignment */}
      <View style={[s.flex1, s.justifyContentCenter, s.p4]}>
        
        {/* Animated Title */}
        <Text style={[s.textCenter, s.mb4, s.fontWeightBold, s.textPrimary, { fontSize: 42 }]}>
          {displayedTitle}
          <Text style={{ color: c.INFO }}>|</Text>
        </Text>
        
        <Text style={[s.textCenter, s.textDark, s.mb3, { marginTop: -20, fontSize: 16 }]}>
          Sign in to continue
        </Text>
        
        <Animated.View entering={FadeInUp.duration(1000).delay(300)}>
          <View style={{ gap: 15 }}>
            <TextInput 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              mode="outlined" 
              style={s.bgWhite} 
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
              style={s.bgWhite} 
              theme={{ roundness: 12 }} 
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)} 
                />
              } 
            />
            
            <View style={{ alignItems: 'flex-end', marginTop: -5, marginBottom: 5 }}>
              <TouchableOpacity onPress={() => router.push('./forgotpassword')}>
                <Text style={[s.textPrimary, s.fontWeightBold, { fontSize: 14 }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={loading} 
              style={[s.mt1, s.rounded]} 
              buttonColor={c.PRIMARY}
              contentStyle={{ paddingVertical: 5 }}
            >
              Login
            </Button>
            
            <View style={[s.flexRow, s.justifyContentCenter, s.mt3]}>
              <Text style={s.textMuted}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('./register')}>
                <Text style={[s.textPrimary, s.fontWeightBold]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={[s.alignItemsCenter, s.mb4, { paddingBottom: 20 }]}>
        <Text style={[{ fontSize: 12 }, s.textMuted]}>© 2026 All Rights Reserved</Text>
        <Text style={[{ fontSize: 12 }, s.textMuted, s.mt1]}>
          Developed by <Text style={[s.fontWeightBold, s.textPrimary]}>MeowsterChief</Text>
        </Text>
      </View>
    </View>
  );
}