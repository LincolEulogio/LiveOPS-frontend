'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { X, ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/shared/store/app.store';
import { authService } from '@/features/auth/api/auth.service';
import { CommandPalette } from '@/shared/components/CommandPalette';

// New Sub-components
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardFooter } from './components/DashboardFooter';

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
              <DashboardSidebar
                pathname={pathname}
                activeProductionId={activeProductionId}
                user={user}
                handleLogout={handleLogout}
                isMobile={true}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <DashboardSidebar
        pathname={pathname}
        activeProductionId={activeProductionId}
        user={user}
        handleLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative selection:bg-indigo-500/30">
        <DashboardHeader
          pathname={pathname}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

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

            <DashboardFooter />
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
