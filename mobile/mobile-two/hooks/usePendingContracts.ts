import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/src/services/api';
import { Contract } from '@/types/contract';

export function usePendingContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await api.get<Contract[]>('/api/contracts/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContracts(response.data ?? []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao carregar contratos pendentes.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPendingContracts();
  }, [fetchPendingContracts]);

  return {
    contracts,
    loading,
    error,
    refresh: fetchPendingContracts,
  };
}
