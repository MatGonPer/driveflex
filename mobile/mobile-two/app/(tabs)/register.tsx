import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import api from '../../src/services/api'; 
import { useRouter } from 'expo-router';
import LoginScreen from './login';

export default function RegistroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [confirmacaoemail, setConfirmacaoEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaosenha, setConfirmacaoSenha] = useState('');

  const handleRegistro = async () => {
    try {
      
      await api.post('/auth/registro', { nome, sobrenome, email, confirmacaoemail, senha, confirmacaosenha});
      
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.back() } 
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível realizar o cadastro.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      
      <TextInput 
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#95a5a6"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput 
        style={styles.input}
        placeholder="Sobrenome"
        placeholderTextColor="#95a5a6"
        value={sobrenome}
        onChangeText={setSobrenome}
      />

      <TextInput 
        style={styles.input}
        placeholder="Data de Nascimento (DD/MM/AAAA)"
        placeholderTextColor="#95a5a6"
        value={dataNascimento} 
        onChangeText={setDataNascimento}
        keyboardType="numeric"
        maxLength={10}
      />

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
        placeholder="Confirme seu e-mail"
        placeholderTextColor="#95a5a6"
        value={email}
        onChangeText={setConfirmacaoEmail}
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

      <TextInput 
        style={styles.input}
        placeholder="Confirme sua senha"
        placeholderTextColor="#95a5a6"
        value={senha}
        onChangeText={setConfirmacaoSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegistro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login.tsx')} style={{ marginTop: 20 }}>
        <Text style={{ color: '#ecf0f1' }}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c3e50', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 30 },
  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, color: '#000' },
  button: { width: '100%', backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});