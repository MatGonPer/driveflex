import React from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ContractCard } from '@/components/ContractCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePendingContracts } from '@/hooks/usePendingContracts';
import { Colors } from '@/constants/theme';
import type { Contract } from '@/types/contract';

const sampleContract: Contract = {
  id: '00000000-0000-0000-0000-000000000000',
  clientId: '11111111-1111-1111-1111-111111111111',
  driverId: '22222222-2222-2222-2222-222222222222',
  status: 'PENDING',
  startTime: '2026-05-20T08:30:00Z',
  endTime: null,
  createdAt: '2026-05-17T12:00:00Z',
  updatedAt: '2026-05-17T12:00:00Z',
};

export default function ContratosPendentes() {
  const colorScheme = useColorScheme();
  const { contracts, loading, error, refresh } = usePendingContracts();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Contratos Pendentes
          </ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            {loading
              ? 'Carregando contratos...'
              : error
              ? 'Verifique sua conexão e atualize.'
              : `${contracts.length} contrato(s) aguardando sua ação`}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <ThemedText type="link" style={styles.refreshText} onPress={refresh}>
              Tentar novamente
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.exampleLabel}>
              Exemplo de contrato
            </ThemedText>
            <ContractCard contract={sampleContract} />
          </View>
        ) : (
          <FlatList
            data={contracts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContractCard 
                contract={item} 
                onEdit={() => router.push({ pathname: '/(tabs)/editContract', params: { contractId: item.id } })}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>Nenhum contrato pendente foi encontrado.</ThemedText>
              </View>
            }
            refreshing={loading}
            onRefresh={refresh}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 14,
  },
  refreshText: {
    textAlign: 'center',
  },
  exampleLabel: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
