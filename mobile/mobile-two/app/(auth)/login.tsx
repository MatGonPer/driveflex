import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';
import {router} from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password: senha,
      });

      const {token, role} = response.data;
      
      // Validar que é cliente (USER)
      if (role !== 'USER') {
        Alert.alert('Acesso Negado', 'Esta tela é apenas para clientes. Motoristas devem usar a tela de login para motoristas.');
        return;
      }
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('email', email);

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.logo}>DriveFlex</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
      </View>

      <View style={styles.form}>
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
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.buttonOutlineText}>Criar uma conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login-motorista')}
          style={styles.linkMotorista}>
          <Text style={styles.linkMotoristaText}>Sou motorista</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2535',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#34495e',
  },
  button: {
    width: '100%',
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#1e8449',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#34495e',
  },
  dividerText: {
    color: '#95a5a6',
    marginHorizontal: 12,
    fontSize: 14,
  },
  buttonOutline: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#27ae60',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkMotorista: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkMotoristaText: {
    color: '#95a5a6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
