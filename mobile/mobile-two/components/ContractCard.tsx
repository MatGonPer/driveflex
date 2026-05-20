import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Contract } from '@/types/contract';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Não definido';
  }

  // Adiciona o Z no final caso o backend não envie, para garantir que o JS entenda que é UTC.
  const dateStr = value.endsWith('Z') ? value : `${value}Z`;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.length > 10 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

export function ContractCard({ contract, onEdit, onDelete }: { contract: Contract; onEdit?: () => void; onDelete?: () => void }) {
  const theme = useColorScheme() ?? 'light';
  const borderColor = theme === 'light' ? '#d0e6f1' : '#2f414f';
  const statusColor = theme === 'light' ? Colors.light.tint : Colors.dark.tint;

  // Tradução do status
  const displayStatus = contract.status === 'PENDING' ? 'Pendente' : contract.status;

  return (
    <ThemedView style={[styles.card, { borderColor }]}> 
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={[styles.status, { color: statusColor }]}>
          {displayStatus.toUpperCase()}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Ida: {formatTimestamp(contract.startTime)}
          {contract.endTime ? ` \u2014 Volta: ${formatTimestamp(contract.endTime)}` : ''}
        </ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Categoria
        </ThemedText>
        <ThemedText>{contract.vehicleCategory === 'car' ? 'carro' : contract.vehicleCategory || 'Não definida'}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Passageiro
        </ThemedText>
        <ThemedText>{contract.passengerName || 'N/A'}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Trajeto
        </ThemedText>
        <ThemedText style={styles.routeText} numberOfLines={1}>{contract.origin} ➔ {contract.destination}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Cliente
        </ThemedText>
        <ThemedText>{contract.clientName || shortId(contract.clientId)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Motorista
        </ThemedText>
        <ThemedText>{contract.driverName || (contract.driverId ? shortId(contract.driverId) : 'Aguardando aceite...')}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Criado em
        </ThemedText>
        <ThemedText>{formatTimestamp(contract.createdAt)}</ThemedText>
      </View>

      {contract.status === 'PENDING' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>Editar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <ThemedText style={styles.deleteButtonText}>Excluir</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    marginBottom: 14,
  },
  status: {
    fontSize: 16,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    color: '#8a9bad',
  },
  routeText: {
    maxWidth: '65%',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 15,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C28FE',
  },
  editButtonText: {
    color: '#6C28FE',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});
