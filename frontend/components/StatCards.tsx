interface StatCardsProps {
  totalSeats: number;
  reserved: number;
  cancelled: number;
}

export default function StatCards({ totalSeats, reserved, cancelled }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-500 text-white rounded-xl p-4 sm:p-6 text-center">
        <div className="text-2xl sm:text-3xl mb-1">👤</div>
        <p className="text-xs sm:text-sm">Total of seats</p>
        <p className="text-3xl sm:text-4xl font-bold mt-2">{totalSeats.toLocaleString()}</p>
      </div>
      <div className="bg-emerald-500 text-white rounded-xl p-4 sm:p-6 text-center">
        <div className="text-2xl sm:text-3xl mb-1">🎟️</div>
        <p className="text-xs sm:text-sm">Reserve</p>
        <p className="text-3xl sm:text-4xl font-bold mt-2">{reserved.toLocaleString()}</p>
      </div>
      <div className="bg-red-400 text-white rounded-xl p-4 sm:p-6 text-center">
        <div className="text-2xl sm:text-3xl mb-1">⊗</div>
        <p className="text-xs sm:text-sm">Cancel</p>
        <p className="text-3xl sm:text-4xl font-bold mt-2">{cancelled.toLocaleString()}</p>
      </div>
    </div>
  );
}
