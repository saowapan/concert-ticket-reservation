interface DeleteModalProps {
  concertName: string;
  show: boolean;
  hasReservations?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ concertName, show, hasReservations = false, onCancel, onConfirm }: DeleteModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-96 text-center">
        <div className="text-red-500 text-3xl sm:text-4xl mb-4">✕</div>
        <p className="text-base sm:text-lg font-medium mb-1">Are you sure to delete?</p>
        <p className="text-gray-500 mb-2">{concertName}</p>
        {hasReservations && (
          <p className="text-amber-600 text-sm mb-4 bg-amber-50 rounded-lg px-3 py-2">
            This concert has active reservations. It will be archived instead of permanently deleted.
          </p>
        )}
        {!hasReservations && <div className="mb-4" />}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
