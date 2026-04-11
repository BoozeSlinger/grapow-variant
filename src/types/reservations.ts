export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'seated' | 'no_show';

export interface Reservation {
  id?: string;
  party_size: number;
  reservation_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes?: string;
  status?: ReservationStatus;
  created_at?: string;
}
