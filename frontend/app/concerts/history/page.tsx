'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import Sidebar from '@/components/Sidebar';
import type { HistoryEntry } from '@/lib/types';

export default function UserHistoryPage() {
  const [userId] = useState(1);
  const { data: history = [], isLoading, error } = useSWR<HistoryEntry[]>(
    `/reservations/history/user/${userId}`,
    fetcher
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar role="user" />

      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500">Loading history...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load history. Please try refreshing.</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No reservation history yet.</p>
        ) : (
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-white">
                <th className="text-left p-3 md:p-4 border border-gray-200 font-semibold text-sm md:text-base">Date time</th>
                <th className="text-left p-3 md:p-4 border border-gray-200 font-semibold text-sm md:text-base">Concert name</th>
                <th className="text-left p-3 md:p-4 border border-gray-200 font-semibold text-sm md:text-base">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="p-3 md:p-4 border border-gray-200 text-sm md:text-base">
                    {new Date(h.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 md:p-4 border border-gray-200 text-sm md:text-base">{h.concert?.name ?? 'Deleted concert'}</td>
                  <td className="p-3 md:p-4 border border-gray-200 text-sm md:text-base capitalize">{h.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
