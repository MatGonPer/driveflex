import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../../src/services/api';
import {useRouter} from 'expo-router';

export default function RegistroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [confirmacaoemail, setConfirmacaoEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaosenha, setConfirmacaoSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const formatarData = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const formatarInputData = (text: string) => {
    const numeros = text.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4)
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  };

  const handleRegistro = async () => {
    if (!nome || !sobrenome || !email || !senha || !dataNascimento) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (email !== confirmacaoemail) {
      Alert.alert('Erro', 'Os e-mails não coincidem.');
      return;
    }
    if (senha !== confirmacaosenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        firstName: nome,
        lastName: sobrenome,
        email,
        password: senha,
        birthDate: formatarData(dataNascimento),
      });

      if (Platform.OS === 'web') {
        window.alert('Conta criada com sucesso!');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
          {text: 'OK', onPress: () => router.replace('/(auth)/login')},
        ]);
      }
    } catch (error: any) {
      console.log('Erro no registro:', error.response?.data);
      Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
      const detalhe = error.response?.data?.message || error.message || 'Erro de conexão com o servidor';
      console.log('Erro no registro:', error.response?.data || error);
      Alert.alert('Erro', `Não foi possível realizar o cadastro.\n\nMotivo: ${detalhe}`);
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
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
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
            onChangeText={text => setDataNascimento(formatarInputData(text))}
            keyboardType="numeric"
            maxLength={10}
          />

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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.linkLogin}>
            <Text style={styles.linkLoginText}>
              Já tem uma conta?{' '}
              <Text style={styles.linkLoginDestaque}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
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
  button: {
    width: '100%',
    backgroundColor: '#2980b9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  linkLogin: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  linkLoginText: {
    color: '#95a5a6',
    fontSize: 14,
  },
  linkLoginDestaque: {
    color: '#2980b9',
    fontWeight: 'bold',
  },
});
