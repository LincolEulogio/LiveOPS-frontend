'use client';

import React, { useState } from 'react';
import { useProduction } from '@/features/productions/hooks/useProductions';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ProductionStatus } from '@/features/productions/types/production.types';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { AlertCircle, Radio, Clock, Video, MessageSquare, X as CloseIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

export const GuestDashboard = ({ productionId }: Props) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
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
            <header className="h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 border-b border-card-border bg-card-bg ">
                <div className="flex items-center gap-3 sm:gap-4 truncate mr-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <Video size={18} className="text-indigo-400" />
                    </div>
                    <div className="truncate">
                        <h1 className="text-sm sm:text-lg font-black text-foreground truncate">{production.name}</h1>
                        <span className="text-[10px] text-muted uppercase  font-black opacity-60">Green Room</span>
                    </div>
                </div>

                {/* Visual Cue */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className={cn(
                        "px-3 sm:px-4 py-1.5 rounded-full border text-[9px] sm:text-xs font-black uppercase  flex items-center gap-1.5 sm:gap-2 transition-all",
                        isLive
                            ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse "
                            : "bg-background border-card-border text-muted"
                    )}>
                        <Radio size={12} className={isLive ? "animate-bounce" : ""} />
                        {isLive ? 'ON AIR' : 'STANDING BY'}
                    </div>

                    {/* Mobile Chat Toggle */}
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="lg:hidden p-2 bg-indigo-600 text-white rounded-xl  "
                    >
                        {isChatOpen ? <CloseIcon size={18} /> : <MessageSquare size={18} />}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className={cn(
                        "absolute inset-0 opacity-10 blur-[100px] transition-colors duration-1000 pointer-events-none",
                        isLive ? 'bg-red-500' : 'bg-indigo-500'
                    )} />

                    <div className="text-center space-y-4 sm:space-y-6 z-10 w-full max-w-2xl px-4 sm:px-10 py-10 sm:py-16 rounded-[2rem] sm:rounded-[3rem] bg-card-bg/40 border border-card-border/50 backdrop-blur-xl ">
                        {isLive ? (
                            <div className="animate-in fade-in zoom-in duration-700">
                                <div className="relative inline-block mb-4">
                                    <Radio size={56} className="text-red-500 mx-auto relative z-10" />
                                    <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse" />
                                </div>
                                <h2 className="text-4xl sm:text-6xl font-black text-foreground er uppercase leading-none italic mb-2">
                                    LIVE <span className="text-red-500">NOW</span>
                                </h2>
                                <p className="text-base sm:text-xl text-muted font-medium mb-6">The broadcast is currently in progress.</p>
                                <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-2xl">
                                    <AlertCircle size={16} className="text-red-400" />
                                    <p className="text-[10px] sm:text-xs text-red-400 font-black uppercase ">Await cues in the Director Comms</p>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Clock size={56} className="text-muted/30 mx-auto mb-4" />
                                <h2 className="text-3xl sm:text-5xl font-black text-foreground er uppercase italic">STANDING <span className="text-indigo-500">BY</span></h2>
                                <p className="text-muted text-sm sm:text-base font-medium mt-2">Production has not started. Please remain ready.</p>
                            </div>
                        )}

                        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Link
                                href={`/productions/${productionId}/room`}
                                className="w-full sm:w-auto px-6 py-4 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/50 rounded-2xl text-white font-black text-xs uppercase  transition-all   flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                <Radio size={18} className="group-hover:animate-pulse" /> Join Stream Source
                            </Link>
                            <Link
                                href={`/productions/${productionId}/prompter`}
                                target="_blank"
                                className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-foreground font-black text-xs uppercase  transition-all  flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Video size={18} /> Teleprompter
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat (Responsive behavior) */}
                <div className={cn(
                    "fixed inset-y-0 right-0 w-[320px] sm:w-[400px] border-l border-card-border bg-card-bg flex flex-col  z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-20",
                    isChatOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="p-4 sm:p-5 border-b border-card-border bg-card-bg/50 flex items-center justify-between">
                        <h3 className="font-black text-foreground uppercase  text-[10px] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Director Comms
                        </h3>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="lg:hidden p-2 text-muted hover:text-foreground transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0">
                            <ChatPanel productionId={productionId} />
                        </div>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                {isChatOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                        onClick={() => setIsChatOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};
