import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from 'expo-router';

import api from '../../src/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', {email, senha});
      
      // Assumindo que o backend retorna { token, role }
      const { token, role } = response.data;
      
      if (role !== 'DRIVER') {
        Alert.alert('Acesso Negado', 'Esta tela é apenas para motoristas.');
        return;
      }
      
      // Salvar token e role
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userRole', role);
      
      Alert.alert('Sucesso', 'Bem-vindo ao DriveFlex!');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'Usuário ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DriveFlex</Text>
      <Text style={styles.logo2}>Motoristas</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#95a5a6"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#95a5a6"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 20,
  },
  logo: {fontSize: 40, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 0},
  logo2: {fontSize: 40, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 30},
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});
