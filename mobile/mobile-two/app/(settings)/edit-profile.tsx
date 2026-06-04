import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/services/api';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { updateUserName } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        const response = await api.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      if (Platform.OS === 'web') {
        alert('Nome e sobrenome são obrigatórios.');
      } else {
        Alert.alert('Erro', 'Nome e sobrenome são obrigatórios.');
      }
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await api.put('/api/users/profile', {
        firstName,
        lastName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await updateUserName(firstName);
      
      if (Platform.OS === 'web') {
        alert('Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      }
      
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      if (Platform.OS === 'web') {
        alert('Erro ao atualizar perfil.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} /> {/* Espaçador para centralizar o título */}
      </View>

      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando dados...</Text>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Seu nome"
              placeholderTextColor="#95a5a6"
            />
            
            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Seu sobrenome"
              placeholderTextColor="#95a5a6"
            />
            
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  loadingText: { color: '#9E9E9E', textAlign: 'center', marginTop: 20 },
  form: { marginTop: 10 },
  label: { color: '#fff', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    color: '#fff',
    padding: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: { backgroundColor: '#2563eb', opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
