type ActionColor = 'red' | 'blue' | 'gray';

interface ConcertCardProps {
  name: string;
  description: string;
  seats: number;
  reservedCount?: number;
  actionLabel: string;
  actionColor: ActionColor;
  onAction: () => void;
  disabled?: boolean;
}

const COLOR_CLASSES: Record<ActionColor, string> = {
  red: 'bg-red-400 hover:bg-red-500',
  blue: 'bg-blue-500 hover:bg-blue-600',
  gray: 'bg-gray-400 cursor-not-allowed',
};

const ACTION_ICONS: Record<string, string> = {
  Delete: '🗑',
  Cancel: '✕',
  Reserve: '🎫',
};

export default function ConcertCard({
  name,
  description,
  seats,
  reservedCount,
  actionLabel,
  actionColor,
  onAction,
  disabled = false,
}: ConcertCardProps) {
  const icon = ACTION_ICONS[actionLabel];

  return (
    <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-4 bg-white">
      <h3 className="text-lg md:text-xl font-semibold text-blue-500 mb-3">{name}</h3>
      <hr className="mb-3" />
      <p className="text-sm md:text-base text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
          👤 {reservedCount !== undefined ? `${reservedCount} / ${seats.toLocaleString()}` : seats.toLocaleString()}
        </span>
        <button
          onClick={onAction}
          disabled={disabled}
          className={`px-4 py-1.5 md:px-5 md:py-2 text-sm md:text-base text-white rounded-lg ${COLOR_CLASSES[actionColor]} transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {icon ? `${icon} ` : ''}{actionLabel}
        </button>
      </div>
    </div>
  );
}
