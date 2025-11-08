'use client';

import Link from 'next/link';
import { LayoutDashboard, MessageSquare, LogOut, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/login');
  };

  const active = (href: string) => {
    if (href === '/dashboard') {
        return pathname === '/dashboard' ? 'bg-white/10' : 'hover:bg-white/10';
    }
    return pathname?.startsWith(href) ? 'bg-white/10' : 'hover:bg-white/10';
  };

  return (
    <aside
      className="h-screen sticky top-0 text-white flex flex-col justify-between"
      style={{ background: '#164f4c', width: 250 }}
    >
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/15 flex items-center justify-center">
            <img
            src="/flex.jpeg"
            alt="Manager Logo"
            className="w-full h-full object-cover"
            />
        </div>
        <span className="font-semibold text-lg">Manager</span>
        </Link>

        <nav className="mt-6 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${active('/dashboard')}`}
          >
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/reviews"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${active('/dashboard/reviews')}`}
          >
            <MessageSquare size={18} /> <span>Reviews</span>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User size={16} className="text-white/90" />
            </div>
            <div>
                <p className="text-sm font-medium text-white">Welcome, Admin!</p>
                <p className="text-xs text-white/70">Administrator</p>
            </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
