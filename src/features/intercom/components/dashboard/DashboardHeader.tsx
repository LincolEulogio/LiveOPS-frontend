import React from 'react';
import { Radio, Activity, ExternalLink, Scissors } from 'lucide-react';
import { TemplateManager } from '../TemplateManager';
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
        <div className="bg-card-bg/60 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-6 md:p-10 flex flex-col min-[1100px]:flex-row items-center justify-between gap-8  relative overflow-hidden group">
            {/* Tactical Scanline */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

            <div className="flex items-center gap-6 w-full min-[1100px]:w-auto relative z-10">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center   border border-indigo-400/20 group-hover:rotate-3 transition-transform">
                    <Radio size={32} className="text-white animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <Activity size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-muted uppercase ">Signal Source Operational</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-foreground uppercase er leading-tight break-words italic">
                        {production?.name || 'INITIALIZING NODE...'}
                    </h1>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full min-[1100px]:w-auto justify-center min-[1100px]:justify-end relative z-10">
                <div className="hidden xl:block mr-2 scale-90">
                    <TemplateManager productionId={activeProductionId} />
                </div>

                <button
                    onClick={() => window.open(`/productions/${activeProductionId}/talent`, '_blank')}
                    className="flex-1 sm:flex-none px-6 py-3.5 bg-background/50 hover:bg-white/5 text-muted hover:text-foreground rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95 border border-card-border flex items-center justify-center gap-3 "
                >
                    <ExternalLink size={16} />
                    Talent Link
                </button>

                <button
                    onClick={() => onMassAlert('TODO READY')}
                    className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95  "
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
                    className="flex-1 sm:flex-none px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95   flex items-center justify-center gap-3"
                >
                    <Scissors size={18} />
                    CLIP
                </button>

                <button
                    onClick={() => onMassAlert('AL AIRE')}
                    className="flex-1 sm:flex-none px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase  transition-all active:scale-95   flex items-center justify-center gap-3 group/live"
                >
                    <div className="w-2 h-2 bg-white rounded-full animate-ping group-hover:scale-125 transition-transform" />
                    LIVE
                </button>
            </div>
        </div>
    );
};
