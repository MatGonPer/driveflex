import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, Redirect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DriverContractCard } from '@/components/DriverContractCard';
import { usePendingContracts } from '@/hooks/usePendingContracts';
import { useDriverProfile } from '@/hooks/useDriverProfile';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function DriverDashboard() {
  const router = useRouter();
  const { role, logout } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useDriverProfile();
  const {
    contracts,
    loading: contractsLoading,
    error: contractsError,
    refresh: refreshContracts,
  } = usePendingContracts();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // ✅ Proteção: Se não for motorista, redireciona
  if (role !== 'DRIVER') {
    return <Redirect href="/" />;
  }

  // Recarregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
      void refreshContracts();
    }, [refreshProfile, refreshContracts])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshContracts()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddVehicle = () => {
    router.push('/addVehicle');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login-motorista');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleContractAccepted = (contractId: string) => {
    // Remover contrato da lista após aceitar
    void refreshContracts();
  };

  const renderProfileSection = () => {
    if (profileLoading) {
      return (
        <ThemedView style={styles.profileCard}>
          <ThemedText style={styles.loadingText}>Carregando perfil...</ThemedText>
        </ThemedView>
      );
    }

    if (profileError) {
      return (
        <ThemedView style={[styles.profileCard, styles.errorCard]}>
          <Ionicons name="alert-circle-outline" size={24} color="#FF6B35" />
          <ThemedText style={styles.errorText}>{profileError}</ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.photoUrl ? (
              <Image
                source={{ uri: profile.photoUrl }}
                style={styles.profileAvatar}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={60} color="#FF6B35" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="title" style={styles.profileName}>
              {profile?.firstName} {profile?.lastName}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{profile?.email}</ThemedText>
            {profile?.currentVehicle && (
              <ThemedText style={styles.vehicleInfo}>
                {profile.currentVehicle.brand} {profile.currentVehicle.model} ({profile.currentVehicle.year})
              </ThemedText>
            )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {profile?.totalTrips !== undefined && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Viagens</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.statValue}>
                {profile.totalTrips}
              </ThemedText>
            </View>
            {profile?.rating !== undefined && (
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Avaliação</ThemedText>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.statValue}
                  >
                    {profile.rating.toFixed(1)}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        )}
      </ThemedView>
    );
  };

  const renderVehicleSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Veículos
          </ThemedText>
          <TouchableOpacity
            style={styles.addVehicleButton}
            onPress={handleAddVehicle}
          >
            <Ionicons name="add-circle-outline" size={28} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.addVehicleHint}>
          Toque no botão acima para adicionar ou atualizar seu veículo.
        </ThemedText>

        {profile?.currentVehicle ? (
          <ThemedView style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <Ionicons name="car-outline" size={32} color="#FF6B35" />
              <View style={styles.vehicleDetails}>
                <ThemedText type="defaultSemiBold">
                  {profile.currentVehicle.brand} {profile.currentVehicle.model}
                </ThemedText>
                <ThemedText style={styles.vehicleSubtext}>
                  {profile.currentVehicle.licensePlate}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.vehicleYear}>
              {profile.currentVehicle.color} - {profile.currentVehicle.year}
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.noVehicleCard}>
            <Ionicons name="car-outline" size={40} color="#666666" />
            <ThemedText style={styles.noVehicleText}>
              Nenhum veículo adicionado
            </ThemedText>
            <TouchableOpacity
              style={styles.addVehicleButtonSmall}
              onPress={handleAddVehicle}
            >
              <ThemedText style={styles.addVehicleButtonText}>
                Adicionar Veículo
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </View>
    );
  };

  const renderContractsSection = () => {
    if (contractsError) {
      return (
        <View style={styles.sectionContainer}>
          <ThemedView style={[styles.errorCard, { marginHorizontal: 16 }]}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF6B35" />
            <ThemedText style={styles.errorText}>{contractsError}</ThemedText>
          </ThemedView>
        </View>
      );
    }

    if (contracts.length === 0 && !contractsLoading) {
      return (
        <View style={styles.sectionContainer}>
          <ThemedView style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={40} color="#666666" />
            <ThemedText style={styles.emptyText}>
              Nenhuma solicitação de contrato no momento
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Novos contratos aparecerão aqui
            </ThemedText>
          </ThemedView>
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Solicitações de Contratos ({contracts.length})
        </ThemedText>
        {contractsLoading ? (
          <ThemedView style={styles.loadingCard}>
            <ThemedText style={styles.loadingText}>
              Carregando solicitações...
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={contracts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DriverContractCard
                contract={item}
                onAccepted={handleContractAccepted}
                onError={(error) => {
                  Alert.alert('Erro', error);
                }}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={{ marginTop: 8 }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.pageTitle}>
            Painel do Motorista
          </ThemedText>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {renderProfileSection()}
        {renderVehicleSection()}
        {renderContractsSection()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
  },
  vehicleInfo: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: '#ffffff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addVehicleButton: {
    padding: 4,
  },
  addVehicleHint: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 12,
    color: '#FF6B35',
  },
  vehicleCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  vehicleYear: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  noVehicleCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVehicleText: {
    fontSize: 14,
    marginTop: 12,
    color: '#999999',
  },
  addVehicleButtonSmall: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  addVehicleButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    color: '#cccccc',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 8,
    color: '#999999',
  },
  loadingCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
  },
  errorCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
