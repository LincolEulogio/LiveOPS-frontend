'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardView } from '@/features/intercom/components/DashboardView';
import { DeviceView } from '@/features/intercom/components/DeviceView';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AppWindow, Smartphone, Info, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/shared/store/app.store';
import Link from 'next/link';

export default function IntercomPage() {
    const { id: productionId } = useParams();
    const { user } = useAuthStore();
    const setAppProductionId = useAppStore((state) => state.setActiveProductionId);
    const [viewMode, setViewMode] = useState<'dashboard' | 'device' | null>(null);

    useEffect(() => {
        if (productionId) {
            setAppProductionId(productionId as string);
        }
    }, [productionId, setAppProductionId]);

    useEffect(() => {
        if (!user || viewMode) return;

        // Default view based on role
        const roleName = (user.role?.name || user.globalRole?.name || '').toUpperCase();
        if (['ADMIN', 'OPERATOR', 'SUPERADMIN'].includes(roleName)) {
            setViewMode('dashboard');
        } else {
            setViewMode('device');
        }
    }, [user, viewMode]);

    if (!viewMode) return null;

    return (
        <div className="-m-6 md:-m-8 bg-background text-foreground min-h-[calc(100vh-4rem)]">
            <header className="relative top-0 h-16 bg-card-bg/40 border-b border-card-border z-50 px-6 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/productions/${productionId}`}
                        className="p-2 bg-card-bg hover:bg-card-border rounded-lg text-muted hover:text-foreground transition-colors border border-card-border"
                        title="Volver a la Producción"
                    >
                        <ChevronLeft size={18} />
                    </Link>
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Info size={18} className="text-white" />
                    </div>
                    <h1 className="font-black uppercase tracking-tighter text-lg md:flex hidden">Live Alert System</h1>
                </div>

                <div className="flex bg-card-bg p-1 rounded-xl border border-card-border">
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'dashboard' ? 'bg-background text-foreground shadow-lg border border-card-border' : 'text-muted hover:text-foreground'}`}
                    >
                        <AppWindow size={14} /> Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode('device')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'device' ? 'bg-background text-foreground shadow-lg border border-card-border' : 'text-muted hover:text-foreground'}`}
                    >
                        <Smartphone size={14} /> Mobile
                    </button>
                </div>
            </header>

            <main className="p-6 md:p-8 max-w-7xl mx-auto">
                {viewMode === 'dashboard' ? <DashboardView /> : <DeviceView />}
            </main>

            {/* Vibration Unlock Overlay (Required by browsers) */}
            {viewMode === 'device' && (
                <div className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-96 p-4 bg-indigo-600 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Smartphone size={20} className="text-white animate-bounce" />
                    </div>
                    <p className="text-xs font-bold text-white leading-tight">
                        Intercom active. Vibration is enabled for alerts.
                    </p>
                </div>
            )}
        </div>
    );
}
