import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contract } from '@/types/contract';

export default function AlterContractScreen() {
  const router = useRouter();
  const { contractId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  // Form states
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [estimatedFare, setEstimatedFare] = useState('');

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await api.get(`/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        setContract(data);
        
        if (data.pickupLocation) setOrigin(data.pickupLocation);
        if (data.dropoffLocation) setDestination(data.dropoffLocation);
        if (data.estimatedFare) setEstimatedFare(data.estimatedFare.toString());
        
        const formatTime = (isoString?: string) => {
          if (!isoString) return '';
          const date = new Date(isoString);
          if (isNaN(date.getTime())) return '';
          const h = String(date.getHours()).padStart(2, '0');
          const m = String(date.getMinutes()).padStart(2, '0');
          return `${h}:${m}`;
        };
        
        setPickupTime(formatTime(data.startTime));
        setReturnTime(formatTime(data.endTime));
        
      } catch (error) {
        console.error('Erro ao buscar detalhes do contrato:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (contractId) {
      fetchContractDetails();
    } else {
      setLoading(false);
    }
  }, [contractId]);

  const handleSave = async () => {
    if (!estimatedFare.trim()) {
      const msg = 'Por favor, insira um valor estimado válido.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Aviso', msg);
      return;
    }

    const fareValue = parseFloat(estimatedFare.replace(',', '.'));
    if (isNaN(fareValue) || fareValue <= 0) {
      const msg = 'Valor inválido.';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Aviso', msg);
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const dateStr = contract?.startTime ? contract.startTime.split('T')[0] : new Date().toISOString().split('T')[0];

      const formatToIso = (time: string) => {
        if (!time) return null;
        const parts = time.split(':');
        const h = parts[0]?.padStart(2, '0') || '00';
        const m = parts[1]?.padStart(2, '0') || '00';
        return `${dateStr}T${h}:${m}:00`;
      };
      
      const payload: any = {
        estimatedFare: fareValue,
        pickupLocation: origin,
        dropoffLocation: destination,
      };
      
      const parsedStartTime = formatToIso(pickupTime);
      if (parsedStartTime) payload.startTime = parsedStartTime;
      
      const parsedEndTime = formatToIso(returnTime);
      if (parsedEndTime) payload.endTime = parsedEndTime;

      await api.put(`/api/contracts/${contractId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const successMsg = 'Contrato alterado com sucesso! O status voltou para pendente.';
      if (Platform.OS === 'web') alert(successMsg); else Alert.alert('Sucesso', successMsg);
      
      router.back();
    } catch (error: any) {
      console.error('Erro ao alterar contrato:', error);
      const msg = error.response?.data?.error || error.message || 'Erro de conexão com o servidor';
      if (Platform.OS === 'web') alert('Erro: ' + msg); else Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = async () => {
      setDeleting(true);
      try {
        const token = await AsyncStorage.getItem('token');
        await api.delete(`/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Platform.OS === 'web') alert('Contrato excluído com sucesso!');
        else Alert.alert('Sucesso', 'Contrato excluído com sucesso!');
        
        router.replace('/(tabs)/contratosPendentes');
      } catch (error: any) {
        console.error('Erro ao excluir contrato:', error);
        const msg = error.response?.data?.error || error.message || 'Erro de conexão com o servidor';
        if (Platform.OS === 'web') alert('Erro: ' + msg);
        else Alert.alert('Erro', msg);
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Excluir Contrato',
        'Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Contrato</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6C28FE" style={{marginTop: 40}} />
        ) : contract ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Origem</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Rua A, 123"
              placeholderTextColor="#555"
              value={origin}
              onChangeText={setOrigin}
            />

            <Text style={styles.label}>Destino</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Av. B, 456"
              placeholderTextColor="#555"
              value={destination}
              onChangeText={setDestination}
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Horário de Ida</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 07:00"
                  placeholderTextColor="#555"
                  value={pickupTime}
                  onChangeText={setPickupTime}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Horário de Volta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 12:30"
                  placeholderTextColor="#555"
                  value={returnTime}
                  onChangeText={setReturnTime}
                />
              </View>
            </View>

            <Text style={styles.label}>Valor Estimado (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 450.00"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={estimatedFare}
              onChangeText={setEstimatedFare}
            />

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving || deleting}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Alteração</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]} 
              onPress={handleDelete}
              disabled={saving || deleting}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" style={{marginRight: 8}} />
              <Text style={styles.deleteButtonText}>{deleting ? 'Excluindo...' : 'Excluir Contrato'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.helpText}>
              Aviso: Ao alterar o contrato, o status dele voltará para Pendente, e precisará ser aceito novamente.
            </Text>
          </View>
        ) : (
          <Text style={{color: '#fff', textAlign: 'center'}}>Contrato não encontrado.</Text>
        )}
      </ScrollView>
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
  content: { padding: 20 },
  formContainer: { marginTop: 10 },
  label: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
    fontSize: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  column: { flex: 1 },
  saveButton: {
    backgroundColor: '#6C28FE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 10,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: { opacity: 0.5 },
  deleteButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  helpText: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
