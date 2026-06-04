import React, { useState, useCallback } from 'react';
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

export default function MeusContratosScreen() {
  const router = useRouter();
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveContracts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      // Busca contratos ativos (que inclui os aceitos e em andamento)
      const response = await api.get('/api/contracts/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveContracts(response.data);
    } catch (error) {
      console.error('Erro ao buscar meus contratos ativos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveContracts();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActiveContracts();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Contratos Ativos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C28FE" />
        }
      >
        {activeContracts.length === 0 ? (
          <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>
            Você não possui contratos ativos no momento.
          </Text>
        ) : activeContracts.map((contract: any) => (
          <View key={contract.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(contract.clientName || contract.driverName || 'M').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{contract.clientName || contract.driverName}</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="car" size={20} color="#6C28FE" />
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {contract.status === 'ACCEPTED' ? 'Aceito' : 'Ativo'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

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

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.btnDetails}
                onPress={() => router.push(`/(tabs)/editContract?contractId=${contract.id}`)}
              >
                <Text style={styles.btnText}>Ver detalhes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
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
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  statusText: {color: '#4ADE80', fontSize: 12, fontWeight: 'bold'},
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
