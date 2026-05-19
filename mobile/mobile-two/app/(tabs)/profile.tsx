import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from 'expo-router';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    const carregarDados = async () => {
      const emailSalvo = await AsyncStorage.getItem('email');
      const roleSalvo = await AsyncStorage.getItem('role');
      if (emailSalvo) setEmail(emailSalvo);
      if (roleSalvo) setRole(roleSalvo);
    };
    carregarDados();
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente sair da conta?')) {
        AsyncStorage.clear().then(() => router.replace('/(auth)/login'));
      }
    } else {
      Alert.alert('Sair', 'Deseja realmente sair da conta?', [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/(auth)/login');
          },
        },
      ]);
    }
  };

  const isDriver = role === 'DRIVER';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <Text style={styles.headerTitle}>Perfil</Text>

        {/* CARD DO USUÁRIO */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <LinearGradient
              colors={
                isDriver ? ['#f39c12', '#e67e22'] : ['#3b82f6', '#9333ea']
              }
              style={styles.avatar}>
              <Ionicons
                name={isDriver ? 'car-sport' : 'person'}
                size={40}
                color="white"
              />
            </LinearGradient>
            <View style={styles.userDetails}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isDriver ? '🚗 Motorista' : '👤 Passageiro'}
                </Text>
              </View>
              <Text style={styles.userEmail}>{email}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Contratos ativos</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Viagens</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{isDriver ? '⭐ 4.9' : '2'}</Text>
              <Text style={styles.statLabel}>
                {isDriver ? 'Avaliação' : 'Dependentes'}
              </Text>
            </View>
          </View>
        </View>

        {/* ÁREA DO MOTORISTA - só aparece para usuários comuns */}
        {!isDriver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Área do Motorista</Text>
            <TouchableOpacity
              style={styles.driverButton}
              onPress={() => router.push('/(auth)/register-motorista')}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.driverButtonGradient}>
                <View style={styles.driverIconContainer}>
                  <Ionicons name="car-sport-outline" size={22} color="white" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.driverButtonText}>
                    Quero ser motorista
                  </Text>
                  <Text style={styles.driverButtonSub}>
                    Cadastre-se e comece a dirigir
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* OPÇÕES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <MenuButton
            icon="people-outline"
            label="Dependentes"
            sub="Gerenciar passageiros"
          />
          <MenuButton
            icon="card-outline"
            label="Pagamento"
            sub="Cartões e formas de pagamento"
          />
          {isDriver && (
            <MenuButton
              icon="document-text-outline"
              label="Meus contratos"
              sub="Visualizar contratos ativos"
            />
          )}
        </View>

        {/* BOTÃO LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuButton({icon, label, sub}: any) {
  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color="#9E9E9E" />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{label}</Text>
        <Text style={styles.listItemSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0a'},
  scrollContent: {padding: 20},
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 25,
  },
  profileInfo: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {marginLeft: 15},
  roleBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {color: '#fff', fontSize: 13, fontWeight: '600'},
  userEmail: {color: '#9E9E9E', fontSize: 13},
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 15,
  },
  statItem: {flex: 1, alignItems: 'center'},
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2a2a2a',
  },
  statValue: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  statLabel: {color: '#666', fontSize: 10, textAlign: 'center'},
  section: {marginBottom: 25},
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  driverButton: {borderRadius: 16, overflow: 'hidden'},
  driverButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  driverIconContainer: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverButtonText: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  driverButtonSub: {color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  listItemContent: {flex: 1, marginLeft: 12},
  listItemTitle: {color: '#fff', fontSize: 15, fontWeight: '500'},
  listItemSub: {color: '#666', fontSize: 12},
  menuIconContainer: {
    width: 45,
    height: 45,
    backgroundColor: '#2a2a2a',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e74c3c33',
    gap: 8,
    marginBottom: 20,
  },
  logoutText: {color: '#e74c3c', fontSize: 16, fontWeight: '600'},
});
