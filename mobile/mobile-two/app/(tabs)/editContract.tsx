import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function EditContractScreen() {
  const router = useRouter();
  const { contractId, fromHistory } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [contract, setContract] = useState<any>(null);

  // Form states
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [estimatedFare, setEstimatedFare] = useState('');
  
  // Date and Time specific states
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [originalStartDate, setOriginalStartDate] = useState('');
  const [originalEndDate, setOriginalEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const toggleDay = (day: string) => {
    if (isEditable) {
      setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    }
  };

  const isEditable = fromHistory !== 'true';

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
        
        setPickupLocation(data.pickupLocation || '');
        setDropoffLocation(data.dropoffLocation || '');
        setEstimatedFare(data.estimatedFare ? data.estimatedFare.toString() : '');
        
        const extractTime = (iso?: string) => {
          if (!iso) return '';
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return '';
          const pad = (n: number) => String(n).padStart(2, '0');
          return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const extractDate = (iso?: string) => {
          if (!iso) return '';
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return '';
          const pad = (n: number) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        };

        setPickupTime(extractTime(data.startTime));
        setOriginalStartDate(extractDate(data.startTime));
        
        setReturnTime(extractTime(data.endTime));
        setOriginalEndDate(extractDate(data.endTime));

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

  const formatTimeToISO = (datePart: string, timePart: string) => {
    if (!datePart || !timePart) return null;
    const parts = timePart.split(':');
    const h = parts[0].padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    return `${datePart}T${h}:${m}:00`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        pickupLocation,
        dropoffLocation,
        estimatedFare: estimatedFare ? parseFloat(estimatedFare.replace(',', '.')) : null,
        startTime: formatTimeToISO(originalStartDate, pickupTime),
        endTime: formatTimeToISO(originalEndDate || originalStartDate, returnTime)
      };

      await api.put(`/api/contracts/${contractId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Sucesso', 'Contrato atualizado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar contrato:', error);
      const msg = error.response?.data?.error || 'Erro ao salvar contrato';
      Alert.alert('Erro', msg);
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
        
        router.back();
      } catch (error: any) {
        const msg = error.response?.data?.error || 'Erro de conexão com o servidor';
        if (Platform.OS === 'web') alert('Erro: ' + msg);
        else Alert.alert('Erro', msg);
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
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
        <Text style={styles.headerTitle}>{isEditable ? 'Editar Contrato' : 'Detalhes do Contrato'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6C28FE" style={{marginTop: 40}} />
        ) : contract ? (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Origem</Text>
              {isEditable ? (
                <TextInput
                  style={styles.input}
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  placeholder="Endereço de partida"
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.valueText}>{pickupLocation || 'Não informada'}</Text>
              )}
              
              <View style={styles.divider} />

              <Text style={styles.label}>Destino</Text>
              {isEditable ? (
                <TextInput
                  style={styles.input}
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                  placeholder="Endereço de chegada"
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.valueText}>{dropoffLocation || 'Não informado'}</Text>
              )}
              
              <View style={styles.divider} />

              <Text style={styles.label}>Dias da Semana</Text>
              <View style={styles.weekRow}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(day)}
                    disabled={!isEditable}
                    style={[
                      styles.dayBtn,
                      selectedDays.includes(day) && styles.activeDayBtn,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        selectedDays.includes(day) && styles.activeDayText,
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Horário (Ida)</Text>
                  {isEditable ? (
                    <TextInput
                      style={styles.input}
                      value={pickupTime}
                      onChangeText={setPickupTime}
                      placeholder="07:00"
                      placeholderTextColor="#666"
                    />
                  ) : (
                    <Text style={styles.valueText}>{pickupTime || 'A definir'}</Text>
                  )}
                </View>
                <View style={[styles.column, {marginLeft: 12}]}>
                  <Text style={styles.label}>Horário (Volta)</Text>
                  {isEditable ? (
                    <TextInput
                      style={styles.input}
                      value={returnTime}
                      onChangeText={setReturnTime}
                      placeholder="12:30"
                      placeholderTextColor="#666"
                    />
                  ) : (
                    <Text style={styles.valueText}>{returnTime || 'A definir'}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>Valor Estimado (R$)</Text>
              {isEditable ? (
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={estimatedFare}
                  onChangeText={setEstimatedFare}
                  keyboardType="numeric"
                  placeholder="Ex: 450.00"
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.priceText}>
                  R$ {estimatedFare || 'A combinar'}
                </Text>
              )}
            </View>
            
            {isEditable && (
              <>
                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.disabledButton]} 
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#fff" style={{marginRight: 8}} />
                      <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                    </>
                  )}
                </TouchableOpacity>

                {contract.driverId && (
                  <TouchableOpacity 
                    style={styles.negotiateButton} 
                    onPress={() => router.push(`/(tabs)/chat?id=${contractId}`)}
                  >
                    <Ionicons name="chatbubbles" size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.negotiateButtonText}>Negociar Alterações (Chat)</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.deleteButton, deleting && styles.disabledButton]} 
                  onPress={handleDelete}
                  disabled={deleting}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" style={{marginRight: 8}} />
                  <Text style={styles.deleteButtonText}>{deleting ? 'Excluindo...' : 'Excluir Contrato'}</Text>
                </TouchableOpacity>
              </>
            )}
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
  infoContainer: { marginTop: 10 },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
  },
  label: { color: '#888', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  valueText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  priceText: { color: '#4ADE80', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1 },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  dayBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeDayBtn: { backgroundColor: '#6C28FE', borderColor: '#6C28FE' },
  dayText: { color: '#666', fontSize: 13 },
  activeDayText: { color: 'white', fontWeight: 'bold' },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  priceInput: {
    color: '#4ADE80',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  negotiateButton: {
    backgroundColor: '#6C28FE',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  negotiateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
  disabledButton: { opacity: 0.5 },
  deleteButtonText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
});
