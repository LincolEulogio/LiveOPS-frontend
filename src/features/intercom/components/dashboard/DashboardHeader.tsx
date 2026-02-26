import React from 'react';
import { Radio, Activity, ExternalLink, Scissors } from 'lucide-react';
import { TemplateManager } from '@/features/intercom/components/TemplateManager';
import { apiClient } from '@/shared/api/api.client';
import { Production } from '@/features/productions/types/production.types';

interface DashboardHeaderProps {
    production: Production | undefined;
    activeProductionId: string;
    onMassAlert: (message: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    production,
    activeProductionId,
    onMassAlert
}) => {
    return (
        <div className="bg-white/90 dark:bg-[#050508]/60 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col min-[1100px]:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl shadow-indigo-500/10 dark:shadow-none">
            {/* Tactical Background Elements */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="flex items-center gap-6 w-full min-[1100px]:w-auto relative z-10">
                <div className="relative group/icon">
                    <div className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-400/30 relative z-10 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                        <Radio size={32} className="text-white animate-pulse" />
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                            <Activity size={12} className="text-indigo-500 dark:text-indigo-400 animate-bounce" />
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-tighter">Signal Locked</span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/60 dark:text-muted/60 uppercase tracking-[0.2em]">Operational Hub</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-foreground uppercase tracking-tight leading-tight break-words italic group-hover:text-indigo-600 dark:group-hover:text-indigo-50 transition-colors">
                        {production?.name || 'INITIALIZING NODE...'}
                    </h1>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full min-[1100px]:w-auto justify-center min-[1100px]:justify-end relative z-10">
                <div className="hidden xl:block mr-2">
                    <TemplateManager productionId={activeProductionId} />
                </div>

                <button
                    onClick={() => window.open(`/productions/${activeProductionId}/talent`, '_blank')}
                    className="flex-1 sm:flex-none px-6 py-4 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.08] text-muted-foreground dark:text-muted hover:text-foreground rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 border border-black/5 dark:border-white/5 flex items-center justify-center gap-3 group/talent shadow-sm"
                >
                    <ExternalLink size={16} className="text-indigo-500 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
                    Talent View
                </button>

                {/* Status Group */}
                <div className="flex items-center bg-gray-50/50 dark:bg-black/40 p-1.5 rounded-[1.4rem] border border-black/5 dark:border-white/5 gap-2 w-full sm:w-auto shadow-inner">
                    <button
                        onClick={() => onMassAlert('TODO READY')}
                        className="flex-1 sm:flex-initial px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
                    >
                        READY
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                await apiClient.post(`/productions/${activeProductionId}/automation/instant-clip`);
                            } catch (e) {
                                console.error('Failed to trigger instant clip', e);
                            }
                        }}
                        className="flex-1 sm:flex-initial px-6 py-3.5 bg-amber-500/10 dark:bg-amber-500/10 hover:bg-amber-500 dark:hover:bg-amber-500 border border-amber-500/20 hover:text-white dark:hover:text-black text-amber-600 dark:text-amber-500 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Scissors size={18} />
                        CLIP
                    </button>

                    <button
                        onClick={() => onMassAlert('AL AIRE')}
                        className="flex-1 sm:flex-initial px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-3 group/live shadow-lg shadow-red-600/20"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-ping group-hover:scale-125 transition-transform shadow-[0_0_10px_white]" />
                        LIVE
                    </button>
                </div>
            </div>
        </div>
    );
};
