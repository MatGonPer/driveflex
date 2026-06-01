import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/services/api';
import { DriverProfile } from '@/types/driver';

const VEHICLE_STORAGE_KEY = 'driverVehicle';

// Mock data para testes sem backend
const MOCK_PROFILE: DriverProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
  birthDate: '1990-05-15',
  role: 'DRIVER',
  createdAt: '2024-01-15T10:30:00',
  photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
  totalTrips: 45,
  rating: 4.8,
  currentVehicle: {
    id: 'vehicle-123',
    driverId: '123e4567-e89b-12d3-a456-426614174000',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    licensePlate: 'ABC-1234',
    color: 'Preto',
    createdAt: '2024-01-10T10:30:00',
    updatedAt: '2024-01-10T10:30:00',
  },
};

async function getPersistedVehicle() {
  try {
    const raw = await AsyncStorage.getItem(VEHICLE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DriverProfile['currentVehicle']) : null;
  } catch {
    return null;
  }
}

export function useDriverProfile() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      const persistedVehicle = await getPersistedVehicle();

      if (!token) {
        console.warn('Token ausente, usando mock profile.');
        setProfile({
          ...MOCK_PROFILE,
          currentVehicle: persistedVehicle ?? MOCK_PROFILE.currentVehicle,
        });
        return;
      }

      try {
        // Tentar buscar do backend
        const response = await api.get<DriverProfile>('/api/driver/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile({
          ...response.data,
          currentVehicle: persistedVehicle ?? response.data.currentVehicle,
        });
      } catch (apiError) {
        // Se falhar, usar mock data
        console.warn('Backend indisponível, usando mock profile:', apiError);
        setProfile({
          ...MOCK_PROFILE,
          currentVehicle: persistedVehicle ?? MOCK_PROFILE.currentVehicle,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao carregar perfil do motorista.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDriverProfile();
  }, [fetchDriverProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchDriverProfile,
  };
}
