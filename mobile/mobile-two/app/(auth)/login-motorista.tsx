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
import {useRouter} from 'expo-router';
import {useAuth} from '@/context/AuthContext';
import api from '../../src/services/api';

export default function LoginMotoristaScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {login} = useAuth();

  const mostrarAlerta = (titulo: string, mensagem: string, callback?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}: ${mensagem}`);
      if (callback) callback();
    } else {
      Alert.alert(titulo, mensagem, callback ? [{text: 'OK', onPress: callback}] : undefined);
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      mostrarAlerta('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', {email, password: senha});

      const {token, role, name} = response.data;

      if (role !== 'DRIVER') {
        mostrarAlerta('Acesso Negado', 'Esta conta não é de motorista. Use o login de cliente.');
        return;
      }

      // Salvar no AuthContext (que também salva no AsyncStorage)
      await login(token, role, email, name);

      mostrarAlerta('Sucesso', 'Bem-vindo ao DriveFlex, motorista!', () => {
        router.replace('/(tabs)');
      });
    } catch (error: any) {
      console.log('Erro no login do motorista:', error.response?.data || error);
      const detalhe = error.response?.data?.message || 'E-mail ou senha inválidos.';
      mostrarAlerta('Erro', detalhe);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.logo}>DriveFlex</Text>
        <Text style={styles.logoSub}>Motoristas</Text>
        <Text style={styles.subtitle}>Entre com sua conta de motorista</Text>
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
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Entrando...' : 'Entrar como Motorista'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => router.push('/(auth)/register-motorista')}>
          <Text style={styles.buttonOutlineText}>Criar conta de motorista</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.linkCliente}>
          <Text style={styles.linkClienteText}>Sou cliente</Text>
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
  logoSub: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
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
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
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
    borderColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#3498db',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkCliente: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkClienteText: {
    color: '#95a5a6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
