import React, { useState, useEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Contrato = {
  id: string;
  cliente: string;
  descricao: string;
  data: string;
  valor: string;
  status: 'pendente' | 'aceito' | 'concluido';
};

const contratosPendentes: Contrato[] = [
  {
    id: '1',
    cliente: 'João Silva',
    descricao: 'Instalação de equipamentos',
    data: '2026-05-20',
    valor: 'R$ 1.250,00',
    status: 'pendente',
  },
  {
    id: '2',
    cliente: 'Maria Souza',
    descricao: 'Manutenção de frota',
    data: '2026-05-22',
    valor: 'R$ 950,00',
    status: 'pendente',
  },
  {
    id: '3',
    cliente: 'Carlos Oliveira',
    descricao: 'Entrega urgente',
    data: '2026-05-19',
    valor: 'R$ 500,00',
    status: 'pendente',
  },
];

function ContratoCard({ contrato }: { contrato: Contrato }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{contrato.cliente}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#fbbf24' }]}>
          <Text style={styles.statusText}>Pendente</Text>
        </View>
      </View>
      <Text style={styles.cardText}>{contrato.descricao}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>📅 {contrato.data}</Text>
        <Text style={styles.cardValue}>{contrato.valor}</Text>
      </View>
    </View>
  );
}

export default function ContratosPendentes() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1f2937' }]}>Contratos Pendentes</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          {contratosPendentes.length} contratos aguardando sua ação
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={contratosPendentes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ContratoCard contrato={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                ✅ Nenhum contrato pendente encontrado!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350f',
  },
  cardText: {
    color: '#4b5563',
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    color: '#6b7280',
    fontSize: 13,
  },
  cardValue: {
    fontWeight: '700',
    color: '#059669',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
