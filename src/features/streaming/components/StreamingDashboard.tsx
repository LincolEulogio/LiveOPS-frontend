'use client';

import { useStreaming } from '@/features/streaming/hooks/useStreaming';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { ObsControls } from '@/features/streaming/components/ObsControls';
import { VmixControls } from '@/features/streaming/components/VmixControls';
import { Wifi, WifiOff, Activity, Loader2 } from 'lucide-react';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';
import { cn } from '@/shared/utils/cn';

interface StreamingDashboardProps {
    productionId: string;
    engineType: EngineType;
}

export function StreamingDashboard({ productionId, engineType }: StreamingDashboardProps) {
    const { state, isLoading, isSocketConnected, sendCommand, isPending } = useStreaming(productionId);

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        ' ': () => {
            if (engineType === EngineType.VMIX) {
                sendCommand({ type: 'VMIX_CUT' });
            }
        },
        '1': () => handleQuickScene(0),
        '2': () => handleQuickScene(1),
        '3': () => handleQuickScene(2),
        '4': () => handleQuickScene(3),
        '5': () => handleQuickScene(4),
    }, !isLoading && isSocketConnected);

    const handleQuickScene = (index: number) => {
        if (engineType === EngineType.OBS && state?.obs?.scenes?.[index]) {
            sendCommand({ type: 'CHANGE_SCENE', sceneName: state.obs.scenes[index] });
        } else if (engineType === EngineType.VMIX) {
            sendCommand({ type: 'VMIX_SELECT_INPUT', payload: { input: index + 1 } });
        }
    };

    if (isLoading) {
        return (
            <div className="bg-card-bg/50 border border-card-border rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-4 backdrop-blur-xl">
                <div className="relative">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                </div>
                <p className="text-muted font-black uppercase  text-[10px]">Establishing Secure Link...</p>
            </div>
        );
    }

    const isEngineConnected = state?.isConnected || false;

    return (
        <div className="space-y-6">
            {/* Compact Real-time Status Bar */}
            <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-2xl p-2 sm:p-3 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4 sm:gap-6 pl-2">
                    <div className="flex items-center gap-2.5">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500",
                            isSocketConnected ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-red-500 animate-pulse"
                        )} />
                        <span className="text-[9px] font-black text-muted uppercase ">Gateway</span>
                    </div>

                    <div className="flex items-center gap-2.5 border-l border-card-border pl-4 sm:pl-6">
                        {isEngineConnected ? (
                            <Wifi size={14} className="text-emerald-500" />
                        ) : (
                            <WifiOff size={14} className="text-red-500" />
                        )}
                        <span className="text-[9px] font-black text-muted uppercase ">
                            {engineType} {isEngineConnected ? 'Live' : 'Sync Error'}
                        </span>
                    </div>
                </div>

                <div className="hidden xs:flex items-center gap-4 px-4 py-1.5 bg-background/50 rounded-xl border border-card-border">
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted uppercase ">
                        <Activity size={12} className="text-indigo-400" />
                        <span className="opacity-60">Last Pulse:</span>
                        <span className="text-foreground">{state?.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString() : '---'}</span>
                    </div>
                </div>
            </div>

            {/* Engine Specific Controls - Premium Container */}
            <div className="bg-card-bg/80 backdrop-blur-2xl border border-card-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />

                <div className="p-1 px-8 bg-white/5 border-b border-card-border/50 flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-indigo-400 uppercase  py-4">Live Operational Surface</h2>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/20" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                    </div>
                </div>

                <div className="p-6 sm:p-10">
                    {engineType === EngineType.OBS ? (
                        <ObsControls
                            productionId={productionId}
                            state={state?.obs}
                            sendCommand={sendCommand}
                            isPending={isPending}
                            isDisconnected={!isEngineConnected}
                        />
                    ) : (
                        <VmixControls
                            productionId={productionId}
                            state={state?.vmix}
                            sendCommand={sendCommand}
                            isPending={isPending}
                            isDisconnected={!isEngineConnected}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
