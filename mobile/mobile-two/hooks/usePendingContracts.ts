import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/src/services/api';
import { ContractWithDetails } from '@/types/contract';

// Mock data para testes sem backend
const MOCK_CONTRACTS: ContractWithDetails[] = [
  {
    id: 'contract-1',
    clientId: 'client-1',
    driverId: 'driver-1',
    status: 'PENDING',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contract-2',
    clientId: 'client-2',
    driverId: 'driver-1',
    status: 'PENDING',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function usePendingContracts() {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      const rejectedStr = await AsyncStorage.getItem('rejectedContracts');
      const rejectedList: string[] = rejectedStr ? JSON.parse(rejectedStr) : [];

      if (!token) {
        console.warn('Token ausente, usando mock contracts.');
        const filteredMock = MOCK_CONTRACTS.filter(c => !rejectedList.includes(c.id));
        setContracts(filteredMock);
        return;
      }

      try {
        // Tentar buscar do backend
        const response = await api.get<ContractWithDetails[]>('/api/contracts/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data ?? [];
        const filtered = data.filter(c => !rejectedList.includes(c.id) && !c.driverId);
        setContracts(filtered);
      } catch (apiError) {
        // Se falhar, usar mock data
        console.warn('Backend indisponível, usando mock contracts:', apiError);
        const filteredMock = MOCK_CONTRACTS.filter(c => !rejectedList.includes(c.id));
        setContracts(filteredMock);
      }
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
