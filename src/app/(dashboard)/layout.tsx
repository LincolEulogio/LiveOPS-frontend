'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/features/auth/api/auth.service';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, clearAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.push('/login');
    }
  }, [token, isMounted, router]);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push('/login');
  };

  // Prevent hydration mismatch or flashing protected content
  if (!isMounted || !token) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <span className="text-stone-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-950 text-stone-100 overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-stone-800 bg-stone-950 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-stone-800">
          <Link href="/profile" className="text-lg font-bold text-white tracking-tight">
            LiveOPS
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Navigation Items placeholder */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/profile' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <UserIcon size={18} />
            Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Operator'}</p>
              <p className="text-xs text-stone-500 truncate">{user?.role?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950">
        <header className="h-16 border-b border-stone-800 flex items-center px-6 md:hidden">
          <span className="font-bold">LiveOPS</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
