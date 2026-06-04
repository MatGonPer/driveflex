import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/src/services/api';
import { ContractWithDetails } from '@/types/contract';

export function useActiveContracts() {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.warn('Token ausente, usando mock contracts.');
        setContracts([]);
        return;
      }

      try {
        const response = await api.get<ContractWithDetails[]>('/api/contracts/active', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContracts(response.data ?? []);
      } catch (apiError) {
        console.warn('Backend indisponível ou erro ao carregar contratos ativos:', apiError);
        setContracts([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao carregar contratos ativos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActiveContracts();
  }, [fetchActiveContracts]);

  return {
    contracts,
    loading,
    error,
    refresh: fetchActiveContracts,
  };
}
