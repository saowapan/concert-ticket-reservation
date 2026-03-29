'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import Sidebar from '@/components/Sidebar';
import ConcertCard from '@/components/ConcertCard';
import Toast from '@/components/Toast';
import type { Concert, Reservation, ToastState } from '@/lib/types';

export default function UserConcertsPage() {
  const [userId] = useState(1);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: concerts = [], mutate: mutateConcerts, isLoading, error } = useSWR<Concert[]>('/concerts', fetcher);
  const { data: userReservations = [], mutate: mutateReservations } = useSWR<Reservation[]>(
    `/reservations/user/${userId}`,
    fetcher
  );

  const isReserved = (concertId: number) => {
    return userReservations.find((r) => r.concert.id === concertId);
  };

  const refreshAll = () => {
    mutateConcerts();
    mutateReservations();
  };

  const showError = (err: unknown, fallback: string) => {
    const axiosErr = err as { response?: { data?: { message?: string } } };
    setToast({
      show: true,
      message: axiosErr.response?.data?.message || fallback,
      type: 'error',
    });
  };

  const handleReserve = async (concertId: number) => {
    setLoadingId(concertId);
    try {
      await api.post('/reservations', { userId, concertId });
      setToast({ show: true, message: 'Reserved successfully', type: 'success' });
      refreshAll();
    } catch (err: unknown) {
      showError(err, 'Failed to reserve');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (concertId: number) => {
    const reservation = isReserved(concertId);
    if (!reservation) return;
    setLoadingId(concertId);
    try {
      await api.delete(`/reservations/${reservation.id}`);
      setToast({ show: true, message: 'Cancelled successfully', type: 'success' });
      refreshAll();
    } catch (err: unknown) {
      showError(err, 'Failed to cancel');
    } finally {
      setLoadingId(null);
    }
  };

  const getActionProps = (concert: Concert) => {
    const reserved = isReserved(concert.id);
    const soldOut = concert.reservations.length >= concert.seats;
    const isActioning = loadingId === concert.id;

    if (reserved) {
      return {
        actionLabel: isActioning ? 'Cancelling...' : 'Cancel',
        actionColor: 'red' as const,
        onAction: () => handleCancel(concert.id),
        disabled: isActioning,
      };
    }
    if (soldOut) {
      return {
        actionLabel: 'Sold Out',
        actionColor: 'gray' as const,
        onAction: () => {},
        disabled: true,
      };
    }
    return {
      actionLabel: isActioning ? 'Reserving...' : 'Reserve',
      actionColor: 'blue' as const,
      onAction: () => handleReserve(concert.id),
      disabled: isActioning,
    };
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar role="user" />

      <main className="flex-1 p-4 md:p-8">
        {isLoading ? (
          <p className="text-gray-500">Loading concerts...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load concerts. Please try refreshing.</p>
        ) : concerts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No concerts available yet.</p>
        ) : (
          concerts.map((concert) => (
            <ConcertCard
              key={concert.id}
              name={concert.name}
              description={concert.description}
              seats={concert.seats}
              reservedCount={concert.reservations.length}
              {...getActionProps(concert)}
            />
          ))
        )}
      </main>

      <Toast
        message={toast.message}
        show={toast.show}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}
