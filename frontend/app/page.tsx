import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
        Concert Ticket Reservation
      </h1>
      <p className="text-gray-500 text-lg mb-10 text-center max-w-md">
        Browse concerts, reserve your seats, and manage your bookings.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/concerts"
          className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg font-medium hover:bg-blue-600 transition text-center"
        >
          Browse Concerts
        </Link>
        <Link
          href="/admin"
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-100 transition text-center"
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
