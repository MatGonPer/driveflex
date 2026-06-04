import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ContractWithDetails } from '@/types/contract';
import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface DriverContractCardProps {
  contract: ContractWithDetails;
  onAccepted?: (contractId: string) => void;
  onRejected?: (contractId: string) => void;
  onError?: (error: string) => void;
}

export function DriverContractCard({
  contract,
  onAccepted,
  onRejected,
  onError,
}: DriverContractCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleAcceptContract = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('Token ausente, aceitando contrato em modo mock.');
        onAccepted?.(contract.id);
        Alert.alert('Sucesso', 'Contrato aceito localmente no modo preview.');
        return;
      }

      try {
        // Chamar API para aceitar contrato
        // TODO: Implementar endpoint no backend: PATCH /api/contracts/{id}/accept
        await api.patch(
          `/api/contracts/${contract.id}/accept`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        onAccepted?.(contract.id);
        Alert.alert('Sucesso', 'Contrato aceito com sucesso!');
      } catch (apiError) {
        console.warn('Backend indisponível, aceitando contrato em modo mock.', apiError);
        onAccepted?.(contract.id);
        Alert.alert('Sucesso', 'Contrato aceito localmente no modo preview.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao aceitar contrato';
      onError?.(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectContract = async () => {
    try {
      setIsLoading(true);
      const rejectedStr = await AsyncStorage.getItem('rejectedContracts');
      const rejectedList = rejectedStr ? JSON.parse(rejectedStr) : [];
      if (!rejectedList.includes(contract.id)) {
        rejectedList.push(contract.id);
        await AsyncStorage.setItem('rejectedContracts', JSON.stringify(rejectedList));
      }
      
      if (Platform.OS === 'web') {
        alert('Contrato recusado com sucesso.');
      } else {
        Alert.alert('Sucesso', 'Contrato recusado com sucesso.');
      }
      onRejected?.(contract.id);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Erro ao recusar contrato';
      if (Platform.OS === 'web') {
        alert('Erro: ' + msg);
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              onRejected?.(contract.id);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar contrato';
              Alert.alert('Erro', errorMessage);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleProposeChange = () => {
    router.push(`/(tabs)/chat?id=${contract.id}`);
  };

  const formatDateTime = (dateTimeString: string | null): string => {
    if (!dateTimeString) {
      return '-';
    }

    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTimeString;
    }
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <Ionicons
            name="person-circle-outline"
            size={40}
            color="#FF6B35"
            style={styles.avatar}
          />
          <View style={styles.clientDetails}>
            <ThemedText type="defaultSemiBold" style={styles.clientName}>
              {contract.clientName ?? contract.clientId}
            </ThemedText>
            <ThemedText style={styles.smallText}>
              Solicitado em {formatDateTime(contract.createdAt)}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.badge, contract.status === 'ACCEPTED' ? styles.activeBadge : styles.pendingBadge]}>
          <ThemedText style={styles.badgeText}>
            {contract.status === 'ACCEPTED' ? 'ATIVO' : 'PENDENTE'}
          </ThemedText>
        </View>
      </View>

      {contract.pickupLocation && (
        <View style={styles.locationSection}>
          <View style={styles.locationItem}>
            <Ionicons name="location-sharp" size={16} color="#FF6B35" />
            <ThemedText style={styles.locationText} numberOfLines={2}>
              {contract.pickupLocation}
            </ThemedText>
          </View>
          {contract.dropoffLocation && (
            <>
              <View style={styles.divider} />
              <View style={styles.locationItem}>
                <Ionicons name="location-sharp" size={16} color="#666666" />
                <ThemedText style={styles.locationText} numberOfLines={2}>
                  {contract.dropoffLocation}
                </ThemedText>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666666" />
          <ThemedText style={styles.detailText}>
            Início: {formatDateTime(contract.startTime)}
          </ThemedText>
        </View>
        {contract.endTime && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666666" />
            <ThemedText style={styles.detailText}>
              Fim: {formatDateTime(contract.endTime)}
            </ThemedText>
          </View>
        )}
        {contract.estimatedFare && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <ThemedText type="defaultSemiBold" style={styles.fareText}>
              R$ {contract.estimatedFare.toFixed(2)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        {contract.status === 'ACCEPTED' ? (
          <>
            <TouchableOpacity
              style={[styles.rejectButton, { borderColor: '#FF4444' }, isLoading && styles.buttonDisabled]}
              onPress={handleCancelContract}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color="#FF4444" />
              <ThemedText style={[styles.rejectButtonText, { color: '#FF4444' }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: '#2196F3' }, isLoading && styles.buttonDisabled]}
              onPress={handleProposeChange}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles-outline" size={18} color="#ffffff" />
              <ThemedText style={styles.acceptButtonText}>
                Negociar
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.rejectButton, isLoading && styles.buttonDisabled]}
              onPress={handleRejectContract}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color="#ffffff" />
              <ThemedText style={styles.rejectButtonText}>
                Recusar
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, isLoading && styles.buttonDisabled]}
              onPress={handleAcceptContract}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                  <ThemedText style={styles.acceptButtonText}>
                    Aceitar
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        style={{
          marginTop: 12,
          backgroundColor: '#2a2a2a',
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
        onPress={() => router.push(`/(tabs)/editContract?contractId=${contract.id}`)}
      >
        <Ionicons name="information-circle-outline" size={18} color="#ffffff" style={{marginRight: 8}} />
        <ThemedText style={{ color: '#ffffff', fontWeight: 'bold' }}>
          Ver detalhes
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    marginBottom: 4,
  },
  smallText: {
    fontSize: 12,
    color: '#999999',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  pendingBadge: {
    backgroundColor: '#FF6B35',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  locationSection: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    color: '#cccccc',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    marginVertical: 10,
  },
  detailsSection: {
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 10,
    color: '#cccccc',
  },
  fareText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#4CAF50',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
