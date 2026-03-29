export interface Reservation {
  id: number;
  userId: number;
  concertId: number;
  concert: { id: number; name: string };
}

export interface Concert {
  id: number;
  name: string;
  description: string;
  seats: number;
  reservations: Reservation[];
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export interface HistoryEntry {
  id: number;
  action: string;
  createdAt: string;
  user: { username: string };
  concert: { name: string };
}
