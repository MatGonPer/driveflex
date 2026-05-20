export type ContractStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Contract {
  id: string;
  clientId: string;
  driverId: string | null;
  vehicleCategory: string;
  origin: string;
  destination: string;
  passengerName: string;
  clientName?: string;
  driverName?: string;
  status: ContractStatus;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}
