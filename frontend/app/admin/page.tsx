'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import Sidebar from '@/components/Sidebar';
import StatCards from '@/components/StatCards';
import ConcertCard from '@/components/ConcertCard';
import DeleteModal from '@/components/DeleteModal';
import Toast from '@/components/Toast';
import type { Concert, ToastState } from '@/lib/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create'>('overview');
  const [form, setForm] = useState({ name: '', description: '', seats: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; concert: Concert | null }>({
    show: false,
    concert: null,
  });

  const { data: concerts = [], mutate: mutateConcerts, isLoading, error: fetchError } = useSWR<Concert[]>('/concerts', fetcher);
  const { data: stats = { totalSeats: 0, totalReserved: 0, totalCancelled: 0 }, mutate: mutateStats } = useSWR('/concerts/stats/summary', fetcher);

  const refreshAll = () => {
    mutateConcerts();
    mutateStats();
  };

  const isFormValid = form.name.trim() && form.description.trim() && parseInt(form.seats, 10) > 0;

  const createConcert = async () => {
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/concerts', {
        name: form.name,
        description: form.description,
        seats: parseInt(form.seats, 10),
      });
      setForm({ name: '', description: '', seats: '' });
      setToast({ show: true, message: 'Created successfully', type: 'success' });
      setActiveTab('overview');
      refreshAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create concert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.concert) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/concerts/${deleteModal.concert.id}`);
      setDeleteModal({ show: false, concert: null });
      setToast({ show: true, message: 'Deleted successfully', type: 'success' });
      refreshAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setDeleteModal({ show: false, concert: null });
      setToast({
        show: true,
        message: axiosErr.response?.data?.message || 'Failed to delete',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 md:p-8">
        <StatCards
          totalSeats={stats.totalSeats}
          reserved={stats.totalReserved}
          cancelled={stats.totalCancelled}
        />

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-sm ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
                : 'text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2 text-sm ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
                : 'text-gray-400'
            }`}
          >
            Create
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {isLoading ? (
              <p className="text-gray-500">Loading concerts...</p>
            ) : fetchError ? (
              <p className="text-red-500">Failed to load concerts. Please try refreshing.</p>
            ) : concerts.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No concerts created yet. Switch to the Create tab to add one.</p>
            ) : (
              concerts.map((c) => (
                <ConcertCard
                  key={c.id}
                  name={c.name}
                  description={c.description}
                  seats={c.seats}
                  actionLabel="Delete"
                  actionColor="red"
                  onAction={() => setDeleteModal({ show: true, concert: c })}
                />
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="border border-gray-200 rounded-xl p-4 md:p-6 max-w-3xl bg-white">
            <h2 className="text-xl font-semibold text-blue-500 mb-4">Create</h2>
            <hr className="mb-4" />
            {formError && <p className="text-red-500 mb-4">{formError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="concertName" className="block text-sm font-medium mb-1">Concert Name</label>
                <input
                  id="concertName"
                  type="text"
                  placeholder="Please input concert name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="totalSeats" className="block text-sm font-medium mb-1">Total of seat</label>
                <input
                  id="totalSeats"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="description"
                placeholder="Please input description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={createConcert}
                disabled={!isFormValid || isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        )}
      </main>

      <DeleteModal
        concertName={deleteModal.concert?.name || ''}
        show={deleteModal.show}
        onCancel={() => setDeleteModal({ show: false, concert: null })}
        onConfirm={confirmDelete}
      />

      <Toast
        message={toast.message}
        show={toast.show}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}
