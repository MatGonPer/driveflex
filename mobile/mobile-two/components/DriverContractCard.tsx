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

interface DriverContractCardProps {
  contract: ContractWithDetails;
  onAccepted?: (contractId: string) => void;
  onError?: (error: string) => void;
}

export function DriverContractCard({
  contract,
  onAccepted,
  onError,
}: DriverContractCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);

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
        <View style={[styles.badge, styles.pendingBadge]}>
          <ThemedText style={styles.badgeText}>PENDENTE</ThemedText>
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

      <TouchableOpacity
        style={[styles.acceptButton, isLoading && styles.acceptButtonDisabled]}
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
              Aceitar Contrato
            </ThemedText>
          </>
        )}
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
  acceptButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
