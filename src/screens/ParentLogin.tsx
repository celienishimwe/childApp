import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MAIN_GRADIENT, BUTTON_COLOR } from '../config/colors';

interface ParentLoginProps {
  onLoginSuccess: (parent: any) => void;
  onBack: () => void;
}

const ParentLogin: React.FC<ParentLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://<your-server>/parent-dashboard/api/parent/login/', {
        email,
        password,
      });
      onLoginSuccess(response.data);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={MAIN_GRADIENT} style={styles.gradient}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={styles.form}>
          <Text style={styles.title}>Parent Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backText: { color: 'white', fontSize: 18 },
  form: { width: '85%', padding: 24, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)', elevation: 2, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: BUTTON_COLOR },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, marginBottom: 18, fontSize: 16, width: '100%', backgroundColor: '#f8f9fa' },
  button: { backgroundColor: BUTTON_COLOR, padding: 16, borderRadius: 8, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ParentLogin; 