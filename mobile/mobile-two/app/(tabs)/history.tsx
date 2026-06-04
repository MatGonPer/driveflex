import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useRouter, useFocusEffect} from 'expo-router';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export default function HistoryScreen() {
  const router = useRouter();
  const { userName } = useAuth();
  const [historyContracts, setHistoryContracts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistoryContracts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/api/contracts/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtra os contratos PENDENTES, exibindo apenas aceitos, ativos, concluídos ou cancelados
      const filteredContracts = response.data.filter((c: any) => c.status !== 'PENDING');
      setHistoryContracts(filteredContracts);
    } catch (error) {
      console.error('Erro ao buscar histórico de contratos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistoryContracts();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistoryContracts();
    setRefreshing(false);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'Aceito' };
      case 'IN_PROGRESS':
        return { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ADE80', label: 'Ativo' };
      case 'COMPLETED':
        return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'Concluído' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Cancelado' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Histórico</Text>
          <Text style={styles.headerSub}>Todos os seus contratos</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C28FE" />
        }
      >
        {historyContracts.length === 0 ? (
          <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Nenhum contrato no histórico.</Text>
        ) : historyContracts.map((contract: any) => {
          const statusStyle = getStatusStyle(contract.status);
          
          return (
            <View key={contract.id} style={styles.card}>
              {/* Topo do Card */}
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(contract.driverName || contract.clientName || 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{contract.driverName || contract.clientName || 'Usuário'}</Text>
                  <View style={styles.statusRow}>
                    <MaterialCommunityIcons
                      name="car"
                      size={20}
                      color="#6C28FE"
                    />
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Rota (Timeline) */}
              <View style={styles.routeContainer}>
                <View style={styles.timeline}>
                  <View style={[styles.dot, {backgroundColor: '#4ADE80'}]} />
                  <View style={styles.line} />
                  <View style={[styles.dot, {backgroundColor: '#F87171'}]} />
                </View>
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>Origem</Text>
                  <Text style={styles.routeText}>{contract.pickupLocation}</Text>
                  <View style={{height: 15}} />
                  <Text style={styles.routeLabel}>Destino</Text>
                  <Text style={styles.routeText}>{contract.dropoffLocation}</Text>
                </View>
              </View>

              {/* Ações */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.btnDetails}
                  onPress={() => router.push(`/(tabs)/editContract?contractId=${contract.id}&fromHistory=true`)}
                >
                  <Text style={styles.btnText}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {color: 'white', fontSize: 24, fontWeight: 'bold'},
  headerSub: {color: '#9E9E9E', fontSize: 14},
  scrollContent: {padding: 20, paddingBottom: 100},
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 15,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  userInfo: {marginLeft: 15},
  userName: {color: '#fff', fontSize: 18, fontWeight: '600'},
  statusRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  statusText: {fontSize: 12, fontWeight: 'bold'},
  routeContainer: {flexDirection: 'row', marginBottom: 20},
  timeline: {alignItems: 'center', width: 20, marginRight: 10},
  dot: {width: 8, height: 8, borderRadius: 4},
  line: {width: 2, flex: 1, backgroundColor: '#333', marginVertical: 4},
  routeDetails: {flex: 1},
  routeLabel: {color: '#666', fontSize: 12},
  routeText: {color: '#fff', fontSize: 14, marginTop: 2},
  actionRow: {flexDirection: 'row', gap: 10},
  btnDetails: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  btnText: {color: '#fff', fontWeight: 'bold'},
});
