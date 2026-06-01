export type ContractStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Contract {
  id: string;
  clientId: string;
  driverId: string;
  status: ContractStatus;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithDetails extends Contract {
  clientName?: string;
  clientEmail?: string;
  driverName?: string;
  driverEmail?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  estimatedFare?: number;
}
