import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

export default function RegistroScreen() {
  const router = useRouter();
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
  const animacaoBalanço = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacaoBalanço, { toValue: 2, duration: 1000, useNativeDriver: true }),
        Animated.timing(animacaoBalanço, { toValue: 0, duration: 1000, useNativeDriver: true }),
       ])
    ).start();
  }, []);

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

  const formatarCPF = (text: string) => {

  const value = text.replace(/\D/g, '');
  
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.title2}>Motorista</Text>
      
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
        placeholder="CPF (000.000.000-00)"
        placeholderTextColor="#95a5a6"
        value={cpf}
        onChangeText={(text) => setCpf(formatarCPF(text))}
        keyboardType="numeric"
        maxLength={14} 
      />

      <TextInput 
        style={styles.input}
        placeholder="Número da CNH (11 dígitos)"
        placeholderTextColor="#95a5a6"
        value={cnh}
        onChangeText={(text) => setCnh(text.replace(/\D/g, ''))} 
        keyboardType="numeric"
        maxLength={11} 
      />

      <TouchableOpacity 
        onPress={() => setExpandido(!expandido)} 
        style={[styles.balaoContainer, { transform: [{ translateY: animacaoBalanço }] }]}
      >
        <View style={expandido ? styles.balaoExpandido : styles.balaoFechado}>
          <Text style={styles.balaoText}>
          {expandido 
            ? "⚠️ Atenção: A CNH deve conter 'EAR' (Atividade Remunerada) e a categoria compatível com o veículo." 
            : "⚠️ Ver requisitos da CNH"}
          </Text>
        </View>
      </TouchableOpacity>

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

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: '#ecf0f1' }}>Já tem uma conta motorista? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c3e50', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 0, marginTop: 40},
  title2: { fontSize: 32, fontWeight: 'bold', color: '#ecf0f1', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, color: '#000' },
  avisoContainer: { width: '100%', marginBottom: 20, paddingHorizontal: 5 },
  avisoText: { color: '#e74c3c', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  button: { width: '100%', backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  balaoContainer: { width: '100%', alignItems: 'center', marginTop: 5, marginBottom: 20 },
  balaoFechado: { backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, elevation: 5 },
  balaoExpandido: { backgroundColor: '#c0392b', padding: 15, borderRadius: 10, width: '90%', elevation: 5 },
  balaoText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
});