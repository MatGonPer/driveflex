import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [isPaused, setIsPaused] = useState(false);

  // Mock de dados do contrato
  const contract = {
    id: 'CONT-2026-001',
    passenger: 'Carlos Rodrigues',
    type: 'car',
    route: {
      from: 'Rua das Flores, 123',
      to: 'Colégio Santa Maria',
    },
    schedule: {
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      pickupTime: '07:00',
      returnTime: '12:30',
    },
    driver: {
      name: 'João Silva',
      vehicle: 'Honda Civic Branco',
      plate: 'ABC-1234',
      rating: 4.9,
    },
    payment: {
      monthly: 450,
      nextDue: '2026-04-01',
    },
    startDate: '2026-03-10',
  };

  const recentTrips = [
    {date: '09 Mar', time: '07:00', type: 'Ida'},
    {date: '09 Mar', time: '12:30', type: 'Volta'},
    {date: '08 Mar', time: '07:00', type: 'Ida'},
  ];

  const handlePause = () => {
    setIsPaused(!isPaused);
    Alert.alert(
      'Status',
      isPaused ? 'Contrato reativado!' : 'Contrato pausado!',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FIXO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Detalhes do Contrato</Text>
          <Text style={styles.headerSub}>#{contract.id}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* STATUS CARD */}
        <View style={[styles.statusCard, isPaused && styles.statusCardPaused]}>
          <View
            style={[
              styles.dot,
              {backgroundColor: isPaused ? '#eab308' : '#22c55e'},
            ]}
          />
          <View>
            <Text
              style={[
                styles.statusText,
                {color: isPaused ? '#eab308' : '#4ade80'},
              ]}>
              {isPaused ? 'Contrato Pausado' : 'Contrato Ativo'}
            </Text>
            <Text style={styles.smallGray}>Iniciado em 10/03/2026</Text>
          </View>
        </View>

        {/* PASSAGEIRO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color="#6C28FE" />
            <Text style={styles.sectionTitle}>Passageiro</Text>
          </View>
          <View style={styles.row}>
            <LinearGradient
              colors={['#6C28FE', '#4F46E5']}
              style={styles.avatar}>
              <Text style={styles.avatarText}>
                {contract.passenger.charAt(0)}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.whiteBold}>{contract.passenger}</Text>
              <Text style={styles.smallGray}>Transporte Escolar</Text>
            </View>
          </View>
        </View>

        {/* ROTA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map-outline" size={18} color="#6C28FE" />
            <Text style={styles.sectionTitle}>Rota</Text>
          </View>
          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <View style={[styles.miniDot, {backgroundColor: '#22c55e'}]} />
              <Text style={styles.routeText}>{contract.route.from}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <View style={[styles.miniDot, {backgroundColor: '#ef4444'}]} />
              <Text style={styles.routeText}>{contract.route.to}</Text>
            </View>
          </View>
        </View>

        {/* PAGAMENTO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={18} color="#6C28FE" />
            <Text style={styles.sectionTitle}>Pagamento</Text>
          </View>
          <View style={styles.rowSpace}>
            <View>
              <Text style={styles.smallGray}>Mensalidade</Text>
              <Text style={styles.priceText}>R$ 450,00</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.smallGray}>Próximo Venc.</Text>
              <Text style={styles.whiteText}>01/04/2026</Text>
            </View>
          </View>
        </View>

        {/* VIAGENS RECENTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viagens Recentes</Text>
          {recentTrips.map((trip, i) => (
            <View key={i} style={styles.tripRow}>
              <View style={{width: 50}}>
                <Text style={styles.whiteText}>{trip.date}</Text>
                <Text style={styles.smallGray}>{trip.time}</Text>
              </View>
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.whiteText}>{trip.type}</Text>
                <Text style={styles.smallGray}>Concluída com sucesso</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            </View>
          ))}
        </View>

        {/* BOTÕES DE AÇÃO */}
        <TouchableOpacity style={styles.pauseBtn} onPress={handlePause}>
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={20}
            color="#eab308"
          />
          <Text style={styles.pauseBtnText}>
            {isPaused ? 'Reativar Contrato' : 'Pausar Temporariamente'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => Alert.alert('Cancelar', 'Deseja cancelar?')}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.cancelBtnText}>Cancelar Contrato</Text>
        </TouchableOpacity>
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
  headerTitle: {color: 'white', fontSize: 20, fontWeight: 'bold'},
  headerSub: {color: '#666', fontSize: 13},
  editBtn: {backgroundColor: '#1a1a1a', padding: 10, borderRadius: 12},
  scrollContent: {padding: 20, paddingBottom: 100},
  statusCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statusCardPaused: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  dot: {width: 8, height: 8, borderRadius: 4},
  statusText: {fontWeight: 'bold'},
  smallGray: {color: '#666', fontSize: 12},
  section: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {color: 'white', fontSize: 15, fontWeight: '600'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  whiteBold: {color: 'white', fontWeight: 'bold', fontSize: 16},
  whiteText: {color: 'white'},
  priceText: {color: 'white', fontSize: 22, fontWeight: 'bold'},
  routeBox: {gap: 4},
  routeItem: {flexDirection: 'row', alignItems: 'center', gap: 10},
  miniDot: {width: 6, height: 6, borderRadius: 3},
  routeLine: {width: 1, height: 15, backgroundColor: '#333', marginLeft: 2.5},
  routeText: {color: '#bbb', fontSize: 14},
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    marginBottom: 12,
  },
  pauseBtnText: {color: '#eab308', fontWeight: '600'},
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelBtnText: {color: '#ef4444', fontWeight: '600'},
});
