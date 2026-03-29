interface DeleteModalProps {
  concertName: string;
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ concertName, show, onCancel, onConfirm }: DeleteModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-96 text-center">
        <div className="text-red-500 text-3xl sm:text-4xl mb-4">✕</div>
        <p className="text-base sm:text-lg font-medium mb-1">Are you sure to delete?</p>
        <p className="text-gray-500 mb-6">{concertName}</p>
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
