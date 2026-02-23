'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LogOut, User as UserIcon, Server, Users, Shield, Info, Layers } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/shared/store/app.store';
import { authService } from '@/features/auth/api/auth.service';
import { Guard } from '@/shared/components/Guard';
import { PresenceBar } from '@/shared/components/PresenceBar';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, clearAuth, isHydrated } = useAuthStore();
  const activeProductionId = useAppStore((state) => state.activeProductionId);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-card-border bg-background flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-card-border">
          <Link href="/profile" className="text-lg font-bold text-foreground tracking-tight">
            LiveOPS
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Navigation Items placeholder */}
          <Link
            href="/productions"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/productions') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
          >
            <Server size={18} />
            Productions
          </Link>
          <Link
            href={activeProductionId ? `/productions/${activeProductionId}/intercom` : '/productions'}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/intercom') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
          >
            <Info size={18} />
            Operational Hub
          </Link>
          {activeProductionId && (
            <Link
              href={`/productions/${activeProductionId}/overlays`}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/overlays') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
            >
              <Layers size={18} />
              Graphics Constructor
            </Link>
          )}
          {activeProductionId && (
            <Link
              href={`/productions/${activeProductionId}/guest`}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.includes('/guest') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
            >
              <Users size={18} />
              Guest Panel
            </Link>
          )}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/profile' ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
          >
            <UserIcon size={18} />
            Profile
          </Link>

          {/* Admin Section */}
          <Guard requiredPermissions={['user:manage', 'role:manage']}>
            <div className="pt-4 pb-1 mt-4 border-t border-card-border/50">
              <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Administration</p>
            </div>
          </Guard>

          <Guard requiredPermissions={['user:manage']}>
            <Link
              href="/admin/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/users') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
            >
              <Users size={18} />
              Global Users
            </Link>
          </Guard>

          <Guard requiredPermissions={['role:manage']}>
            <Link
              href="/admin/roles"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/roles') ? 'bg-card-bg text-foreground' : 'text-muted hover:text-foreground hover:bg-card-bg'}`}
            >
              <Shield size={18} />
              Roles & Permissions
            </Link>
          </Guard>
        </nav>

        <div className="p-4 border-t border-card-border bg-background/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 group">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 text-white group-hover:scale-105 transition-transform">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <div className="flex flex-col">
                <p className="text-[10px] text-muted truncate">{user?.email}</p>
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
            className="w-full flex items-center gap-3 px-3 py-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <header className="h-16 border-b border-card-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <span className="font-black text-foreground tracking-tighter md:hidden">LOPS</span>
            <div className="hidden md:block">
              {/* Optional: Breadcrumbs or Page Title could go here */}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ThemeSwitcher />
            <PresenceBar />
            <div className="h-4 w-[1px] bg-card-border hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Live System</span>
            </div>
          </div>
        </header>
        <CommandPalette />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
