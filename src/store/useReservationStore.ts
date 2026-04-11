import { create } from 'zustand';
import { Reservation } from '@/types/reservations';

interface ReservationState {
  partySize: number;
  date: Date | null;
  time: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  
  setPartySize: (size: number) => void;
  setDate: (date: Date | null) => void;
  setTime: (time: string | null) => void;
  setContactInfo: (info: Partial<Pick<ReservationState, 'firstName' | 'lastName' | 'email' | 'phone' | 'notes'>>) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  partySize: 2,
  date: null,
  time: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',

  setPartySize: (partySize) => set({ partySize }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setContactInfo: (info) => set((state) => ({ ...state, ...info })),
  reset: () => set({
    partySize: 2,
    date: null,
    time: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  }),
}));
