'use client';

import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ProductionStatus } from '@/features/productions/types/production.types';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { AlertCircle, Radio, Clock, Video } from 'lucide-react';
import Link from 'next/link';

interface Props {
    productionId: string;
}

export const GuestDashboard = ({ productionId }: Props) => {
    // Initialize sockets and context
    useProductionContextInitializer(productionId);
    const { data: production, isLoading, error } = useProduction(productionId);

    if (isLoading) {
        return <div className="p-8 text-center text-muted animate-pulse">Loading Green Room...</div>;
    }

    if (error || !production) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-muted">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                <p>You don't have permission to view this production.</p>
                <Link href="/productions" className="mt-8 px-6 py-2 bg-card-bg hover:bg-card-border border border-card-border rounded-xl text-foreground font-bold transition-all">Back to Home</Link>
            </div>
        );
    }

    const isLive = production.status === ProductionStatus.ACTIVE;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-background overflow-hidden">
            {/* Header (Simplified) */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-card-border bg-card-bg shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <Video size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">{production.name}</h1>
                        <span className="text-xs text-muted uppercase tracking-widest font-bold">Green Room</span>
                    </div>
                </div>

                {/* Visual Cue */}
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isLive ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-background border-card-border text-muted'
                        }`}>
                        <Radio size={14} />
                        {isLive ? 'ON AIR' : 'STANDING BY'}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-center items-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className={`absolute inset-0 opacity-10 blur-[100px] transition-colors duration-1000 pointer-events-none ${isLive ? 'bg-red-500' : 'bg-indigo-500'
                        }`} />

                    <div className="text-center space-y-6 z-10 max-w-2xl px-6 py-12 rounded-3xl bg-card-bg/50 border border-card-border backdrop-blur-sm shadow-2xl">
                        {isLive ? (
                            <>
                                <Radio size={64} className="text-red-500 mx-auto animate-pulse" />
                                <h2 className="text-5xl font-black text-foreground tracking-tight">WE ARE LIVE</h2>
                                <p className="text-lg text-muted">The show is currently streaming.</p>
                                <p className="text-sm text-red-400 font-bold bg-red-500/10 px-4 py-2 rounded-lg inline-block">Monitor the chat for directions from the Director.</p>
                            </>
                        ) : (
                            <>
                                <Clock size={64} className="text-stone-600 dark:text-stone-400 mx-auto" />
                                <h2 className="text-4xl font-bold text-foreground">Standing By</h2>
                                <p className="text-muted">The production has not started yet. Please wait for the director's cue.</p>
                            </>
                        )}

                        <div className="mt-8 pt-8 border-t border-card-border flex justify-center gap-4">
                            <Link
                                href={`/productions/${productionId}/room`}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                            >
                                <Radio size={18} /> Join as HQ Stream Source
                            </Link>
                            <Link
                                href={`/productions/${productionId}/prompter`}
                                target="_blank"
                                className="px-6 py-3 bg-card-bg hover:bg-card-border border border-card-border rounded-xl text-foreground font-bold transition-all shadow-lg flex items-center gap-2"
                            >
                                <Video size={18} /> Open Teleprompter
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat strictly for communication */}
                <div className="w-[400px] border-l border-card-border bg-card-bg flex flex-col shadow-2xl z-20">
                    <div className="p-4 border-b border-card-border bg-card-bg/50">
                        <h3 className="font-bold text-foreground uppercase tracking-widest text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Director Comms
                        </h3>
                    </div>
                    <div className="flex-1 relative">
                        {/* We reuse the ChatPanel but it will take full height of its container natively if positioned absolute */}
                        <div className="absolute inset-0">
                            <ChatPanel productionId={productionId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
