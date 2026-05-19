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

  const date = new Date(value);
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

export function ContractCard({ contract }: { contract: Contract }) {
  const theme = useColorScheme() ?? 'light';
  const borderColor = theme === 'light' ? '#d0e6f1' : '#2f414f';
  const statusColor = theme === 'light' ? Colors.light.tint : Colors.dark.tint;

  return (
    <ThemedView style={[styles.card, { borderColor }]}> 
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={[styles.status, { color: statusColor }]}>
          {contract.status}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          {formatTimestamp(contract.startTime)}
          {' \u2014 '}
          {contract.endTime ? formatTimestamp(contract.endTime) : 'Em aberto'}
        </ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Cliente
        </ThemedText>
        <ThemedText>{shortId(contract.clientId)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Motorista
        </ThemedText>
        <ThemedText>{shortId(contract.driverId)}</ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Criado em
        </ThemedText>
        <ThemedText>{formatTimestamp(contract.createdAt)}</ThemedText>
      </View>
    </ThemedView>
  );
}

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
});
