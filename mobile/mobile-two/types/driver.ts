/**
 * Tipos TypeScript para entidades relacionadas ao motorista
 */

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  role: 'DRIVER';
  createdAt: string;
  photoUrl?: string;
  currentVehicle?: Vehicle;
  rating?: number;
  totalTrips?: number;
}

export interface Vehicle {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  averageRating: number;
  activeVehicles: number;
}

export interface ContractRequest {
  id: string;
  clientId: string;
  clientName: string;
  driverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  estimatedFare?: number;
}
