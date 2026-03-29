'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'user';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinkClass = (href: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
      pathname === href ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'
    }`;

  const navContent = (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-8">{role === 'admin' ? 'Admin' : 'User'}</h1>

        <nav className="flex flex-col gap-2">
          {role === 'admin' ? (
            <>
              <Link href="/admin" className={navLinkClass('/admin')} onClick={() => setOpen(false)}>
                🏠 Home
              </Link>
              <Link href="/admin/history" className={navLinkClass('/admin/history')} onClick={() => setOpen(false)}>
                📋 History
              </Link>
              <Link href="/concerts" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
                🔄 Switch to user
              </Link>
            </>
          ) : (
            <>
              <Link href="/concerts" className={navLinkClass('/concerts')} onClick={() => setOpen(false)}>
                🏠 Home
              </Link>
              <Link href="/concerts/history" className={navLinkClass('/concerts/history')} onClick={() => setOpen(false)}>
                📋 History
              </Link>
              <Link href="/admin" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-gray-50" onClick={() => setOpen(false)}>
                🔄 Switch to Admin
              </Link>
            </>
          )}
        </nav>
      </div>

      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        ↪ Logout
      </button>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          className="border border-gray-200 rounded-lg p-2 shadow-sm"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col justify-between p-6 z-50 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen border-r border-gray-200 flex-col justify-between p-6 bg-white shrink-0">
        {navContent}
      </aside>
    </>
  );
}
