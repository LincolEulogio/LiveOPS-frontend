'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LogOut, User as UserIcon, Server, Users, Shield, Info, Layers, Menu, X, Activity, Command, Zap, ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useAppStore } from '@/shared/store/app.store';
import { authService } from '@/features/auth/api/auth.service';
import { Guard } from '@/shared/components/Guard';
import { PresenceBar } from '@/shared/components/PresenceBar';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { cn } from '@/shared/utils/cn';
import { useRef } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, clearAuth, isHydrated } = useAuthStore();
  const activeProductionId = useAppStore((state) => state.activeProductionId);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 400);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isHydrated && !token) {
      router.push('/login');
    }
  }, [token, isMounted, isHydrated, router]);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push('/login');
  };

  if (!isMounted || !isHydrated || !token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black text-muted uppercase  animate-pulse">Initializing System</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-indigo-500/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] min-[769px]:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-card-bg/95 backdrop-blur-3xl border-r border-card-border z-[70] flex flex-col min-[769px]:hidden"
            >
              <div className="h-20 flex items-center justify-between px-8 border-b border-card-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap size={18} className="text-white" fill="currentColor" />
                  </div>
                  <span className="text-lg font-black text-foreground er uppercase italic">LiveOPS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted hover:text-foreground transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>
              <SidebarContent pathname={pathname} activeProductionId={activeProductionId} user={user} handleLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-[280px] border-r border-card-border bg-card-bg/40 backdrop-blur-2xl flex flex-col hidden min-[769px]:flex shrink-0 relative overflow-hidden group/sidebar">
        {/* Dynamic Scanline Header */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="h-20 flex items-center px-8 border-b border-card-border/50 bg-white/[0.02]">
          <Link href="/productions" className="flex items-center gap-3 group/logo">
            <div className="w-10 h-10 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center transition-all group-hover:scale-110">
              <Zap size={22} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground er uppercase italic leading-none">LiveOPS</h1>
              <p className="text-[8px] font-black text-indigo-400 uppercase  mt-1 opacity-60">Control Surface</p>
            </div>
          </Link>
        </div>

        <SidebarContent pathname={pathname} activeProductionId={activeProductionId} user={user} handleLogout={handleLogout} />
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative selection:bg-indigo-500/30">
        <header className="h-20 border-b border-card-border/40 bg-background/50 backdrop-blur-2xl z-30">
          <div className="max-w-[1800px] mx-auto h-full flex items-center justify-between px-6 min-[769px]:px-10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-3 -ml-3 text-foreground min-[769px]:hidden hover:bg-white/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-card-border/50"
              >
                <Menu size={24} />
              </button>

              <div className="hidden min-[769px]:flex flex-col">
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-indigo-400" />
                  <h2 className="text-[10px] font-black text-muted uppercase ">Operational Node</h2>
                </div>
                <h1 className="text-lg font-black text-foreground uppercase  mt-0.5">
                  {pathname === '/productions' ? 'Asset Management' :
                    pathname.includes('/intercom') ? 'Tactical Command' :
                      pathname.includes('/overlays') ? 'Visual Pipeline' :
                        pathname.includes('/social') ? 'Engagement Hub' :
                          pathname.includes('/automation') ? 'Logic Engine' : 'Production Core'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 min-[769px]:gap-8">
              <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl group cursor-default">
                <Command size={14} className="text-muted group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-black text-muted uppercase ">K: Search Matrix</span>
              </div>

              <div className="flex items-center gap-4">
                <ThemeSwitcher />
                <PresenceBar />
                <div className="h-6 w-[1px] bg-card-border/50 hidden min-[769px]:block" />
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500/80 uppercase ">Signal Stable</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <CommandPalette />

        {/* Scrollable Workspace */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar relative"
        >
          {/* Ambient Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-[1800px] mx-auto min-[769px]:p-10 lg:p-12 relative min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>

            {/* Tactical Footer */}
            <footer className="mt-12 border-t border-card-border bg-white/[0.02] backdrop-blur-sm py-6 px-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 group/footer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-[2px] bg-indigo-500 group-hover/footer:w-16 transition-all duration-700" />
                <p className="text-[11px] font-black uppercase  text-foreground/70 group-hover/footer:text-foreground transition-colors">
                  Movimiento Misionero Mundial
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
                  <span className="text-[9px] font-bold text-muted uppercase  opacity-60">Lead Architect</span>
                  <span className="text-[11px] font-black text-indigo-400 uppercase ">Lincol E.H</span>
                </div>

                <div className="h-6 w-[1px] bg-card-border hidden md:block" />

                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black text-muted uppercase ">
                    © 2026
                  </p>
                  <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] font-black text-foreground/50 uppercase ">LiveOPS Core</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Tactical Scroll to Top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={scrollToTop}
                className="fixed bottom-28 right-8 z-[100] w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.25rem] flex items-center justify-center border border-indigo-400/30 group active:scale-90 transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.25rem]" />
                <ArrowUp size={24} className="group-hover:animate-bounce" />

                {/* Tactical Label Hint */}
                <div className="absolute right-full mr-4 px-3 py-1.5 bg-card-bg/95 backdrop-blur-md border border-card-border rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none hidden sm:block">
                  <span className="text-[9px] font-black uppercase  text-foreground whitespace-nowrap">Retorno a Base</span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const SidebarContent = ({ pathname, activeProductionId, user, handleLogout }: any) => (
  <>
    <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2 custom-scrollbar">
      <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Core Systems</p>

      <SidebarLink
        href="/productions"
        icon={Server}
        label="Productions"
        active={pathname === '/productions' || (pathname.startsWith('/productions/') && !pathname.includes('intercom') && !pathname.includes('overlays') && !pathname.includes('guest'))}
      />

      <SidebarLink
        href={activeProductionId ? `/productions/${activeProductionId}/intercom` : '/productions'}
        icon={Zap}
        label="Operational Hub"
        active={pathname.includes('/intercom')}
      />

      {activeProductionId && (
        <>
          <div className="h-4" />
          <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Active Engine</p>
          <SidebarLink
            href={`/productions/${activeProductionId}/overlays`}
            icon={Layers}
            label="Graphics Engine"
            active={pathname.includes('/overlays')}
          />
          <SidebarLink
            href={`/productions/${activeProductionId}/guest`}
            icon={Users}
            label="Guest Panel"
            active={pathname.includes('/guest')}
          />
        </>
      )}

      <div className="h-4" />
      <p className="px-4 text-[9px] font-black text-muted uppercase  mb-4 opacity-40">Identity</p>
      <SidebarLink
        href="/profile"
        icon={UserIcon}
        label="Operator Profile"
        active={pathname === '/profile'}
      />

      <Guard requiredPermissions={['user:manage', 'role:manage']}>
        <div className="h-8" />
        <p className="px-4 text-[9px] font-black text-indigo-400 uppercase  mb-4 opacity-60">Administration</p>

        <Guard requiredPermissions={['user:manage']}>
          <SidebarLink
            href="/admin/users"
            icon={Users}
            label="Global Users"
            active={pathname.startsWith('/admin/users')}
          />
        </Guard>

        <Guard requiredPermissions={['role:manage']}>
          <SidebarLink
            href="/admin/roles"
            icon={Shield}
            label="Permissions Matrix"
            active={pathname.startsWith('/admin/roles')}
          />
        </Guard>
      </Guard>
    </nav>

    {/* Sidebar User Hub */}
    <div className="p-6 bg-white/[0.03] border-t border-card-border/50">
      <div className="p-4 bg-background/60 backdrop-blur-md rounded-2xl border border-card-border/60 flex items-center gap-4 mb-4 relative overflow-hidden group/user">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600/20" />
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-black text-white shrink-0 group-hover/user:scale-110 transition-all">
          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-foreground truncate er uppercase leading-none mb-1">{user?.name || 'Operator'}</p>
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[9px] font-bold text-muted truncate uppercase ">{user?.globalRole?.name || 'Authorized'}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-between px-5 py-4 text-muted hover:text-white hover:bg-red-600 rounded-2xl transition-all duration-300 group mb-2"
      >
        <div className="flex items-center gap-3">
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-[12px] capitalize ">Terminate Session</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-muted/20 group-hover:bg-white" />
      </button>
    </div>
  </>
);

const SidebarLink = ({ href, icon: Icon, label, active }: any) => (
  <Link
    href={href}
    className={cn(
      "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group/link relative overflow-hidden",
      active
        ? "bg-indigo-600 text-white"
        : "text-muted hover:text-foreground hover:bg-white/5"
    )}
  >
    <div className="flex items-center gap-4 relative z-10">
      <Icon size={20} className={cn("transition-transform group-hover/link:scale-110", active ? "text-white" : "text-indigo-400")} />
      <span className="text-[12px] font-bold capitalize ">{label}</span>
    </div>
    {active && (
      <div className="w-1.5 h-1.5 rounded-full bg-white relative z-10" />
    )}
    {active && (
      <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/10" />
    )}
  </Link>
);
