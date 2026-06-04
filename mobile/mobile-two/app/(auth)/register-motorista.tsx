import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRouter} from 'expo-router';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '@/context/AuthContext';

export default function RegisterMotoristaScreen() {
  const router = useRouter();
  const {isAuthenticated, login} = useAuth();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cnh, setCnh] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [confirmacaoemail, setConfirmacaoEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaosenha, setConfirmacaoSenha] = useState('');
  const [expandido, setExpandido] = useState(false);
  const [loading, setLoading] = useState(false);
  const animacaoBalanco = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacaoBalanco, {
          toValue: 4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animacaoBalanco, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const formatarData = (data: string) => {
    const numeros = data.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4)
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  };

  const converterData = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const formatarCPF = (text: string) => {
    const value = text.replace(/\D/g, '');
    return value
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const mostrarAlerta = (titulo: string, mensagem: string, callback?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}: ${mensagem}`);
      if (callback) callback();
    } else {
      Alert.alert(titulo, mensagem, callback ? [{text: 'OK', onPress: callback}] : undefined);
    }
  };

  const handleRegistro = async () => {
    if (isAuthenticated) {
      if (!nome || !sobrenome || !dataNascimento || !cpf || !cnh) {
        mostrarAlerta('Atenção', 'Preencha todos os campos.');
        return;
      }
    } else {
      if (
        !nome ||
        !sobrenome ||
        !email ||
        !senha ||
        !dataNascimento ||
        !cpf ||
        !cnh
      ) {
        mostrarAlerta('Atenção', 'Preencha todos os campos.');
        return;
      }
      if (email !== confirmacaoemail) {
        mostrarAlerta('Erro', 'Os e-mails não coincidem.');
        return;
      }
      if (senha !== confirmacaosenha) {
        mostrarAlerta('Erro', 'As senhas não coincidem.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isAuthenticated) {
        const token = await AsyncStorage.getItem('token');
        const response = await api.post('/api/driver/upgrade', {
          cpf: cpf.replace(/\D/g, ''),
          cnh,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const {token: newToken} = response.data;
        await login(newToken, 'DRIVER');

        mostrarAlerta('Sucesso', 'Sua conta foi atualizada para motorista com sucesso!', () => {
          router.replace('/driver-dashboard');
        });
      } else {
        await api.post('/auth/register', {
          firstName: nome,
          lastName: sobrenome,
          email,
          password: senha,
          birthDate: converterData(dataNascimento),
          cpf: cpf.replace(/\D/g, ''),
          cnh,
          role: 'DRIVER',
        });

        mostrarAlerta('Sucesso', 'Conta de motorista criada com sucesso!', () => {
          router.replace('/(auth)/login-motorista');
        });
      }
    } catch (error: any) {
      console.log('Erro no registro:', error.response?.data);
      const detalhe = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro de conexão com o servidor';
      console.log('Erro no registro:', error.response?.data || error);
      mostrarAlerta('Erro', `Não foi possível realizar o cadastro.\n\nMotivo: ${detalhe}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#1a2535'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.titleMotorista}>Motorista</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para começar a dirigir
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#95a5a6"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Sobrenome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu sobrenome"
            placeholderTextColor="#95a5a6"
            value={sobrenome}
            onChangeText={setSobrenome}
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#95a5a6"
            value={dataNascimento}
            onChangeText={text => setDataNascimento(formatarData(text))}
            keyboardType="numeric"
            maxLength={10}
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#95a5a6"
            value={cpf}
            onChangeText={text => setCpf(formatarCPF(text))}
            keyboardType="numeric"
            maxLength={14}
          />

          <Text style={styles.label}>Número da CNH</Text>
          <TextInput
            style={styles.input}
            placeholder="11 dígitos"
            placeholderTextColor="#95a5a6"
            value={cnh}
            onChangeText={text => setCnh(text.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={11}
          />

          {/* Balão de aviso animado */}
          <TouchableOpacity
            onPress={() => setExpandido(!expandido)}
            style={styles.balaoContainer}>
            <Animated.View
              style={[
                expandido ? styles.balaoExpandido : styles.balaoFechado,
                {transform: [{translateY: animacaoBalanco}]},
              ]}>
              <Text style={styles.balaoText}>
                {expandido
                  ? '⚠️ A CNH deve conter "EAR" (Atividade Remunerada) e categoria compatível com o veículo.'
                  : '⚠️ Ver requisitos da CNH'}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {!isAuthenticated && (
            <>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#95a5a6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Confirme o E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#95a5a6"
                value={confirmacaoemail}
                onChangeText={setConfirmacaoEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#95a5a6"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />

              <Text style={styles.label}>Confirme a Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita sua senha"
                placeholderTextColor="#95a5a6"
                value={confirmacaosenha}
                onChangeText={setConfirmacaoSenha}
                secureTextEntry
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar como Motorista'}
            </Text>
          </TouchableOpacity>

          {!isAuthenticated && (
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login-motorista')}
              style={styles.linkLogin}>
              <Text style={styles.linkLoginText}>
                Já tem conta?{' '}
                <Text style={styles.linkLoginDestaque}>Faça login</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: 24, paddingTop: 60},
  header: {alignItems: 'center', marginBottom: 32},
  title: {fontSize: 36, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1},
  titleMotorista: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    letterSpacing: 1,
  },
  subtitle: {fontSize: 15, color: '#95a5a6', marginTop: 6},
  form: {width: '100%'},
  label: {
    color: '#bdc3c7',
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#34495e',
  },
  balaoContainer: {width: '100%', alignItems: 'center', marginBottom: 20},
  balaoFechado: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 5,
  },
  balaoExpandido: {
    backgroundColor: '#c0392b',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    elevation: 5,
  },
  balaoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {opacity: 0.7},
  buttonText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
  linkLogin: {alignItems: 'center', marginTop: 24, marginBottom: 40},
  linkLoginText: {color: '#95a5a6', fontSize: 14},
  linkLoginDestaque: {color: '#3498db', fontWeight: 'bold'},
});
