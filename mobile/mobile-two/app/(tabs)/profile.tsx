import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {LinearGradient} from 'expo-linear-gradient';

export default function ProfileScreen() {
  const dependents = [
    {name: 'Lucas Rodrigues', age: 12, school: 'Colégio Santa Maria'},
    {name: 'Ana Rodrigues', age: 8, school: 'Escola Municipal Centro'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com Perfil */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Perfil</Text>

          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <LinearGradient
                colors={['#3b82f6', '#9333ea']}
                style={styles.avatar}>
                <Ionicons name="person" size={40} color="white" />
              </LinearGradient>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Ravel Rodrigues</Text>
                <Text style={styles.userEmail}>ravel.rodrigues@email.com</Text>
                <Text style={styles.userPhone}>+55 11 98765-4321</Text>
              </View>
            </View>

            {/* Stats */}
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
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Dependentes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dependentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dependentes cadastrados</Text>
          {dependents.map((dep, index) => (
            <TouchableOpacity key={index} style={styles.listItem}>
              <LinearGradient
                colors={['#3b82f6', '#9333ea']}
                style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>{dep.name.charAt(0)}</Text>
              </LinearGradient>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{dep.name}</Text>
                <Text style={styles.listItemSub}>
                  {dep.age} anos • {dep.school}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu de Opções (Exemplos) */}
        <View style={styles.section}>
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
          <MenuButton
            icon="shield-checkmark-outline"
            label="Privacidade"
            sub="Controle seus dados"
          />
        </View>

        {/* Banner Indique e Ganhe */}
        <LinearGradient
          colors={['#9333ea', '#3b82f6']}
          style={styles.promoBanner}>
          <Text style={styles.promoTitle}>Convide pais e responsáveis!</Text>
          <Text style={styles.promoText}>
            Ganhe desconto no próximo mês para cada indicação.
          </Text>
          <TouchableOpacity style={styles.promoBtn}>
            <Text style={styles.promoBtnText}>Compartilhar código</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#F87171" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versão 1.0.0</Text>
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
  headerContainer: {marginBottom: 25},
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
  userName: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  userEmail: {color: '#9E9E9E', fontSize: 14},
  userPhone: {color: '#666', fontSize: 12, marginTop: 2},
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    marginTop: 10,
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
  miniAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
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
  promoBanner: {padding: 20, borderRadius: 20, marginBottom: 25},
  promoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoText: {color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 15},
  promoBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  promoBtnText: {color: '#000', fontWeight: 'bold', fontSize: 14},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  logoutText: {color: '#F87171', fontSize: 16, fontWeight: '600'},
  version: {color: '#444', textAlign: 'center', fontSize: 12, marginBottom: 20},
});
