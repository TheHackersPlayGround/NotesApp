import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Import your Bootstrap utilities
import { s, c } from '../styles/bootstrap';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);

  // --- Resend OTP Logic ---
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any; 

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setTimer(60); 
    setCanResend(false);
  };

  const handleRequestOtp = async (isResend = false) => {
    if (!email) return Alert.alert("Required", "Please enter your email.");
    setLoading(true);
    
    try {
      const response = await fetch(`http://192.168.1.4/Api_AppMicarandayo/CORS.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'request_otp', 
          email: email 
        }),
      });

      const res = await response.json();

      if (response.ok) {
        if (!isResend) setStep(2);
        startTimer();
        Alert.alert("Sent", isResend ? "A new code has been sent." : "A 6-digit code has been sent to your email.");
      } else {
        Alert.alert("Error", res.error || "Failed to send OTP.");
      }
    } catch (error: any) {
      Alert.alert("Network Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert("Required", "Please fill in all fields.");
    setLoading(true);
    
    try {
      const response = await fetch(`http://192.168.1.4/Api_AppMicarandayo/CORS.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset_password', 
          email: email,
          otp: otp,
          new_password: newPassword
        }),
      });

      const res = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password updated! You can now login.", [
          { text: "OK", onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert("Error", res.error || "Invalid OTP or request failed.");
      }
    } catch (error: any) {
      Alert.alert("Network Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.flex1, s.bgWhite]}>
      <View style={[s.flex1, s.justifyContentCenter, s.p4]}>
        
        <Text style={[s.textCenter, s.mb4, s.fontWeightBold, s.textPrimary, { fontSize: 32 }]}>
          {step === 1 ? "RESET PASSWORD" : "VERIFY CODE"}
        </Text>

        <Animated.View entering={FadeInUp.duration(800)}>
          <View style={{ gap: 15 }}>
            {step === 1 ? (
              <>
                <Text style={[s.textCenter, s.textMuted, s.mb2]}>
                  Enter your email address to receive a verification code.
                </Text>
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
                <Button 
                  mode="contained" 
                  onPress={() => handleRequestOtp(false)} 
                  loading={loading} 
                  style={s.rounded} 
                  buttonColor={c.PRIMARY}
                >
                  Send OTP Code
                </Button>
              </>
            ) : (
              <>
                <Text style={[s.textCenter, s.textMuted, s.mb2]}>
                  Enter the code sent to {email} and your new password.
                </Text>
                <TextInput 
                  label="6-Digit OTP" 
                  value={otp} 
                  onChangeText={setOtp} 
                  mode="outlined" 
                  style={s.bgWhite} 
                  theme={{ roundness: 12 }} 
                  keyboardType="number-pad" 
                  maxLength={6}
                />
                <TextInput 
                  label="New Password" 
                  value={newPassword} 
                  onChangeText={setNewPassword} 
                  mode="outlined" 
                  style={s.bgWhite} 
                  theme={{ roundness: 12 }} 
                  secureTextEntry 
                />
                <Button 
                  mode="contained" 
                  onPress={handleResetPassword} 
                  loading={loading} 
                  style={s.rounded} 
                  buttonColor={c.PRIMARY}
                >
                  Update Password
                </Button>

                <View style={[s.alignItemsCenter, s.mt2]}>
                  {canResend ? (
                    <TouchableOpacity onPress={() => handleRequestOtp(true)}>
                      <Text style={[s.textPrimary, s.fontWeightBold]}>Resend Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={s.textMuted}>Resend code in {timer}s</Text>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity 
              onPress={() => (step === 1 ? router.back() : setStep(1))} 
              style={s.mt2}
              disabled={loading}
            >
              <Text style={[s.textPrimary, s.textCenter, s.fontWeightBold]}>
                {step === 1 ? "Back to Login" : "Change Email"}
              </Text>
            </TouchableOpacity>
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