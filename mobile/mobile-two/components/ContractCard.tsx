import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Contract } from '@/types/contract';
import api from '@/src/services/api';

function formatTimestamp(value: string | null) {
  if (!value) return 'Não definido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ContractCard({ contract, onDeleted, onError, onEdit }: { contract: any, onDeleted?: (id: string) => void, onError?: (msg: string) => void, onEdit?: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCancelContract = async () => {
    Alert.alert(
      'Aviso de Multa',
      'Cancelar um contrato ativo gera uma multa contratual de R$ 50,00. Deseja confirmar o cancelamento?',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Confirmar Cancelamento',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const token = await AsyncStorage.getItem('token');
              if (token) {
                await api.patch(`/api/contracts/${contract.id}/cancel`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
              Alert.alert('Cancelado', 'Contrato cancelado e multa aplicada.');
              onDeleted?.(contract.id);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar contrato';
              Alert.alert('Erro', errorMessage);
              onError?.(errorMessage);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {(contract.clientName || 'C').charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{contract.clientName || 'Cliente Sem Nome'}</ThemedText>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="car" size={16} color={contract.status === 'ACCEPTED' ? '#4CAF50' : '#3b82f6'} />
            <View style={[styles.statusBadge, { backgroundColor: contract.status === 'ACCEPTED' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(59, 130, 246, 0.1)' }]}>
              <ThemedText style={[styles.statusText, { color: contract.status === 'ACCEPTED' ? '#4CAF50' : '#3b82f6' }]}>
                {contract.status === 'PENDING' ? 'Pendente' : contract.status === 'ACCEPTED' ? 'Aceito' : contract.status}
              </ThemedText>
            </View>
          </View>
        </View>
        {contract.driverName && (
          <View style={{alignItems: 'flex-end', justifyContent: 'center'}}>
             <ThemedText style={{fontSize: 10, color: '#9ca3af'}}>Motorista</ThemedText>
             <ThemedText style={{fontSize: 12, fontWeight: 'bold'}}>{contract.driverName}</ThemedText>
          </View>
        )}
      </View>

      {/* LOCATIONS */}
      <View style={styles.routeContainer}>
        <View style={styles.timeline}>
          <View style={[styles.dot, {backgroundColor: '#4ADE80'}]} />
          <View style={styles.line} />
          <View style={[styles.dot, {backgroundColor: '#F87171'}]} />
        </View>
        <View style={styles.routeDetails}>
          <ThemedText style={styles.routeLabel}>Origem</ThemedText>
          <ThemedText style={styles.routeText}>{contract.pickupLocation || 'Não informada'}</ThemedText>
          <View style={{height: 12}} />
          <ThemedText style={styles.routeLabel}>Destino</ThemedText>
          <ThemedText style={styles.routeText}>{contract.dropoffLocation || 'Não informada'}</ThemedText>
        </View>
      </View>

      <View style={{borderTopWidth: 1, borderTopColor: '#2a2a2a', marginVertical: 12}} />

      {/* DATES */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16}}>
        <View>
          <ThemedText style={{fontSize: 12, color: '#9ca3af'}}>Início do Contrato</ThemedText>
          <ThemedText style={{fontSize: 13, marginTop: 2, fontWeight: '500'}}>{formatTimestamp(contract.startTime)}</ThemedText>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <ThemedText style={{fontSize: 12, color: '#9ca3af'}}>Fim do Contrato</ThemedText>
          <ThemedText style={{fontSize: 13, marginTop: 2, fontWeight: '500'}}>{contract.endTime ? formatTimestamp(contract.endTime) : 'Em aberto'}</ThemedText>
        </View>
      </View>

      {/* BUTTONS */}
      <View style={styles.actionRow}>
        {contract.status === 'ACCEPTED' && (
          <>
            <TouchableOpacity onPress={() => router.push(`/(tabs)/chat?id=${contract.id}`)} style={[styles.btnAction, {backgroundColor: '#eab308'}]}>
              <ThemedText style={styles.btnText}>Chat</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelContract} style={[styles.btnAction, {backgroundColor: '#ef4444'}]}>
              <ThemedText style={styles.btnText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </>
        )}
        {contract.status === 'PENDING' && (
          <TouchableOpacity onPress={onEdit ? onEdit : () => router.push(`/(tabs)/editContract?contractId=${contract.id}`)} style={[styles.btnAction, {backgroundColor: '#3b82f6', flex: 1}]}>
            <ThemedText style={styles.btnText}>Editar Contrato</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  userInfo: {marginLeft: 12, flex: 1},
  userName: {fontSize: 16, fontWeight: '600'},
  statusRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  statusText: {fontSize: 11, fontWeight: 'bold'},
  routeContainer: {flexDirection: 'row', marginBottom: 10},
  timeline: {alignItems: 'center', width: 20, marginRight: 10},
  dot: {width: 8, height: 8, borderRadius: 4},
  line: {width: 2, flex: 1, backgroundColor: '#333', marginVertical: 4},
  routeDetails: {flex: 1},
  routeLabel: {color: '#9ca3af', fontSize: 12},
  routeText: {fontSize: 14, marginTop: 2, fontWeight: '500'},
  actionRow: {flexDirection: 'row', gap: 10},
  btnAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  btnText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
});
