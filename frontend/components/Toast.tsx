'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, show, type = 'success', onClose }: ToastProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(handleClose, 3000);
    return () => clearTimeout(timer);
  }, [show, handleClose]);

  if (!show) return null;

  const isError = type === 'error';
  const borderColor = isError ? 'border-red-200' : 'border-green-200';
  const icon = isError ? '❌' : '✅';
  const iconColor = isError ? 'text-red-500' : 'text-green-500';

  return (
    <div className={`fixed top-2 right-2 sm:top-4 sm:right-4 bg-white border ${borderColor} rounded-lg px-3 py-2 sm:px-4 sm:py-3 shadow-lg flex items-center gap-2 z-50`}>
      <span className={`${iconColor} text-lg`}>{icon}</span>
      <span className="text-sm">{message}</span>
      <button onClick={handleClose} className="ml-2 text-gray-400 hover:text-gray-600" aria-label="Close notification">✕</button>
    </div>
  );
}
