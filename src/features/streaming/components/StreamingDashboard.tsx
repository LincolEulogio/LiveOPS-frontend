'use client';

import { useStreaming } from '@/features/streaming/hooks/useStreaming';
import { EngineType } from '@/features/streaming/types/streaming.types';
import { ObsControls } from '@/features/streaming/components/ObsControls';
import { VmixControls } from '@/features/streaming/components/VmixControls';
import { Wifi, WifiOff, Activity, Loader2 } from 'lucide-react';
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts';

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
            // vMix inputs are typically numeric 1, 2, 3...
            sendCommand({ type: 'VMIX_SELECT_INPUT', payload: { input: index + 1 } });
        }
    };

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
