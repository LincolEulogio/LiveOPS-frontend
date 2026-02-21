'use client';

import { useStreaming } from '@/features/streaming/hooks/useStreaming';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { ObsControls } from '@/features/streaming/components/ObsControls';
import { VmixControls } from '@/features/streaming/components/VmixControls';
import { Wifi, WifiOff, Activity, Loader2 } from 'lucide-react';

interface StreamingDashboardProps {
    productionId: string;
    engineType: EngineType;
}

export function StreamingDashboard({ productionId, engineType }: StreamingDashboardProps) {
    const { state, isLoading, isSocketConnected, sendCommand, isPending } = useStreaming(productionId);

    if (isLoading) {
        return (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-stone-400 text-sm">Connecting to engine...</p>
            </div>
        );
    }

    const isEngineConnected = state?.isConnected || false;

    return (
        <div className="space-y-6">
            {/* Real-time Status Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Gateway</span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-stone-800 pl-6">
                        {isEngineConnected ? (
                            <Wifi size={14} className="text-emerald-500" />
                        ) : (
                            <WifiOff size={14} className="text-red-500" />
                        )}
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                            {engineType} {isEngineConnected ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                    <div className="flex items-center gap-1.5">
                        <Activity size={14} />
                        <span>Last Sync: {state?.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString() : 'Never'}</span>
                    </div>
                </div>
            </div>

            {/* Engine Specific Controls */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-1 px-6 bg-stone-800/30 border-b border-stone-800">
                    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest py-3">Live Controls</h2>
                </div>

                <div className="p-6">
                    {engineType === EngineType.OBS ? (
                        <ObsControls
                            state={state?.obs}
                            sendCommand={sendCommand}
                            isPending={isPending}
                            isDisconnected={!isEngineConnected}
                        />
                    ) : (
                        <VmixControls
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
