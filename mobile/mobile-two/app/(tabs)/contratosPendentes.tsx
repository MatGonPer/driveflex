import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, View, Alert, Modal, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/services/api';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ContractCard } from '@/components/ContractCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePendingContracts } from '@/hooks/usePendingContracts';
import { Colors } from '@/constants/theme';
import type { Contract } from '@/types/contract';

const sampleContract: Contract = {
  id: '00000000-0000-0000-0000-000000000000',
  clientId: '11111111-1111-1111-1111-111111111111',
  driverId: '22222222-2222-2222-2222-222222222222',
  vehicleCategory: 'car',
  origin: 'Rua A',
  destination: 'Rua B',
  passengerName: 'João Silva',
  clientName: 'Cliente Exemplo',
  driverName: 'Motorista Exemplo',
  status: 'PENDING',
  startTime: '2026-05-20T08:30:00Z',
  endTime: null,
  createdAt: '2026-05-17T12:00:00Z',
  updatedAt: '2026-05-17T12:00:00Z',
};

export default function ContratosPendentes() {
  const colorScheme = useColorScheme();
  const { contracts, loading, error, refresh } = usePendingContracts();
  const isDark = colorScheme === 'dark';

  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editPassenger, setEditPassenger] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const executeDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/api/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Platform.OS === 'web') window.alert('Contrato excluído.');
      else Alert.alert('Sucesso', 'Contrato excluído.');
      refresh();
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Falha ao excluir.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erro', msg);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja excluir este contrato?')) {
        executeDelete(id);
      }
    } else {
      Alert.alert('Confirmar Exclusão', 'Deseja excluir este contrato?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => executeDelete(id) }
      ]);
    }
  };

  const formatTimeOnly = (isoString?: string | null) => {
    if (!isoString) return '';
    const dateStr = isoString.endsWith('Z') ? isoString : `${isoString}Z`;
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setEditOrigin(contract.origin || '');
    setEditDestination(contract.destination || '');
    setEditPassenger(contract.passengerName || '');
    setEditCategory(contract.vehicleCategory || '');
    setEditStartTime(formatTimeOnly(contract.startTime));
    setEditEndTime(formatTimeOnly(contract.endTime));
  };

  const handleSaveEdit = async () => {
    if (!editingContract) return;
    try {
      const token = await AsyncStorage.getItem('token');
      
      const formatInputTime = (timeStr: string) => {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
          return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return timeStr;
      };

      const originalDateStr = editingContract.startTime.endsWith('Z') ? editingContract.startTime : `${editingContract.startTime}Z`;
      const originalDate = new Date(originalDateStr);

      const buildUtcString = (timeStr: string) => {
        if (!timeStr) return '';
        const formatted = formatInputTime(timeStr);
        const [hours, minutes] = formatted.split(':').map(Number);
        const d = new Date(originalDate);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString().substring(0, 19);
      };

      const newStart = buildUtcString(editStartTime);
      const newEnd = editEndTime ? buildUtcString(editEndTime) : '';

      await api.put(`/api/contracts/${editingContract.id}`, {
        origin: editOrigin,
        destination: editDestination,
        passengerName: editPassenger,
        vehicleCategory: editCategory,
        startTime: newStart,
        endTime: newEnd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Platform.OS === 'web') window.alert('Contrato atualizado.');
      else Alert.alert('Sucesso', 'Contrato atualizado.');
      setEditingContract(null);
      refresh();
    } catch (e: any) {
      const msg = e.response?.data?.error || 'Falha ao atualizar.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erro', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Contratos Pendentes
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            {loading
              ? 'Carregando contratos...'
              : error
              ? 'Verifique sua conexão e atualize.'
              : `${contracts.length} contrato(s) aguardando sua ação`}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <ThemedText type="link" style={styles.refreshText} onPress={refresh}>
              Tentar novamente
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.exampleLabel}>
              Exemplo de contrato
            </ThemedText>
            <ContractCard contract={sampleContract} />
          </View>
        ) : (
          <FlatList
            data={contracts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ContractCard contract={item} onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>Nenhum contrato pendente foi encontrado.</ThemedText>
              </View>
            }
            refreshing={loading}
            onRefresh={refresh}
          />
        )}

        <Modal visible={!!editingContract} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>Editar Contrato</ThemedText>
              
              <ScrollView>
                <ThemedText style={styles.inputLabel}>Categoria</ThemedText>
                <View style={styles.categorySelector}>
                  {['moto', 'car', 'van'].map((cat) => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[styles.categoryBtn, editCategory === cat && styles.categoryBtnActive]}
                      onPress={() => setEditCategory(cat)}
                    >
                      <ThemedText style={[styles.categoryBtnText, editCategory === cat && styles.categoryBtnTextActive]}>
                        {cat === 'car' ? 'CARRO' : cat.toUpperCase()}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <ThemedText style={styles.inputLabel}>Passageiro</ThemedText>
                <TextInput style={styles.input} value={editPassenger} onChangeText={setEditPassenger} />
                
                <ThemedText style={styles.inputLabel}>Origem</ThemedText>
                <TextInput style={styles.input} value={editOrigin} onChangeText={setEditOrigin} />
                
                <ThemedText style={styles.inputLabel}>Destino</ThemedText>
                <TextInput style={styles.input} value={editDestination} onChangeText={setEditDestination} />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.inputLabel}>Horário Ida</ThemedText>
                    <TextInput style={styles.input} value={editStartTime} onChangeText={setEditStartTime} placeholder="00:00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.inputLabel}>Horário Volta</ThemedText>
                    <TextInput style={styles.input} value={editEndTime} onChangeText={setEditEndTime} placeholder="00:00" />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setEditingContract(null)} style={styles.cancelBtn}>
                  <ThemedText style={styles.cancelBtnText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdit} style={styles.saveBtn}>
                  <ThemedText style={styles.saveBtnText}>Salvar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 14,
  },
  refreshText: {
    textAlign: 'center',
  },
  exampleLabel: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: 'white',
  },
  inputLabel: {
    marginTop: 10,
    marginBottom: 5,
    color: '#aaa',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  cancelBtnText: {
    color: 'white',
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#6C28FE',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
  },
  categoryBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  categoryBtnActive: {
    borderColor: '#6C28FE',
    backgroundColor: '#6C28FE20',
  },
  categoryBtnText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryBtnTextActive: {
    color: '#6C28FE',
  },
});
