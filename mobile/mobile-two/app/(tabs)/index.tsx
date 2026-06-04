import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {useRouter, useFocusEffect} from 'expo-router';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { userName } = useAuth();
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveContracts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/api/contracts/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveContracts(response.data);
    } catch (error) {
      console.error('Erro ao buscar contratos ativos:', error);
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

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'moto':
        return 'bike';
      case 'car':
        return 'car';
      case 'van':
        return 'van-passenger';
      default:
        return 'car';
    }
  };
  const handlePress = () => {
    router.push('/newContract');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C28FE" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userName || 'Usuário'}!</Text>
          <Text style={styles.subGreeting}>
            Gerencie seus contratos de transporte
          </Text>
        </View>

        {/* Botão Novo Contrato */}
        <TouchableOpacity onPress={handlePress} style={styles.createButton}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createButtonText}>Criar novo contrato</Text>
        </TouchableOpacity>

        {/* Listagem de Contratos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contratos ativos</Text>
          <Text style={styles.activeCount}>
            {activeContracts.length} ativos
          </Text>
        </View>

        {activeContracts.length === 0 ? (
          <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Nenhum contrato ativo no momento.</Text>
        ) : activeContracts.map((contract: any) => (
          <View key={contract.id} style={styles.card}>
            {/* Topo do Card */}
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(contract.driverName || contract.clientName || 'M').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{contract.driverName || contract.clientName || 'Motorista'}</Text>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons
                    name="car"
                    size={20}
                    color="#6C28FE"
                  />
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Ativo</Text>
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
              <TouchableOpacity style={styles.btnChat} onPress={() => router.push(`/(tabs)/chat?id=${contract.id}`)}>
                <Ionicons name="chatbubbles" size={16} color="#fff" />
                <Text style={styles.btnText}>Chat</Text>
              </TouchableOpacity>
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
  scrollContent: {padding: 20},
  header: {marginBottom: 25, marginTop: 10},
  greeting: {fontSize: 26, fontWeight: 'bold', color: '#fff'},
  subGreeting: {fontSize: 14, color: '#9E9E9E'},
  createButton: {
    backgroundColor: '#6C28FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 30,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  activeCount: {color: '#666', fontSize: 14},
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
  btnTrack: {
    flex: 1,
    backgroundColor: '#1D61FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  btnChat: {
    flex: 1,
    backgroundColor: '#6C28FE',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
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
