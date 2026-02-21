'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LogOut, User as UserIcon, Server, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/features/auth/api/auth.service';
import { Guard } from '@/shared/components/Guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, clearAuth, isHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait for store to be rehydrated from localStorage OR for initial client-side mount
    // to avoid false-positive redirect to /login
    if (isMounted && isHydrated && !token) {
      router.push('/login');
    }
  }, [token, isMounted, isHydrated, router]);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push('/login');
  };

  // Prevent hydration mismatch or flashing protected content
  if (!isMounted || !isHydrated || !token) {
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
            href="/productions"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/productions') ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <Server size={18} />
            Productions
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/profile' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
          >
            <UserIcon size={18} />
            Profile
          </Link>

          {/* Admin Section */}
          {(user?.globalRole?.name === 'ADMIN' || user?.role?.name === 'ADMIN') && (
            <>
              <div className="pt-4 pb-1 mt-4 border-t border-stone-800/50">
                <p className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Administration</p>
              </div>

              <Link
                href="/admin/users"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/users') ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
              >
                <Users size={18} />
                Global Users
              </Link>

              <Link
                href="/admin/roles"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/roles') ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
              >
                <Shield size={18} />
                Roles & Permissions
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-stone-800 bg-stone-900/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 group">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <div className="flex flex-col">
                <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
                {user?.globalRole && (
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                    {user.globalRole.name}
                  </p>
                )}
              </div>
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
