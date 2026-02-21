'use client';

import { VmixState, StreamingCommand } from '../types/streaming.types';
import { Play, Repeat, Zap, ZapOff, Grid, AlertCircle } from 'lucide-react';

interface VmixControlsProps {
    state?: VmixState;
    sendCommand: (command: StreamingCommand) => void;
    isPending: boolean;
    isDisconnected: boolean;
}

export function VmixControls({ state, sendCommand, isPending, isDisconnected }: VmixControlsProps) {
    if (isDisconnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <AlertCircle className="text-stone-700" size={48} />
                <div className="space-y-1">
                    <h3 className="text-stone-400 font-semibold">vMix Disconnected</h3>
                    <p className="text-stone-600 text-sm max-w-xs">
                        Verify your vMix Web Controller settings and ensure vMix is running on the target machine.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* State Overview */}
            <div className="flex gap-4">
                <div className="flex-1 bg-stone-950 border border-stone-800 rounded-2xl p-6 text-center">
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-2">Active Input</p>
                    <p className="text-4xl font-mono text-emerald-500">{state?.activeInput || '--'}</p>
                </div>
                <div className="flex-1 bg-stone-950 border border-stone-800 rounded-2xl p-6 text-center">
                    <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-2">Preview Input</p>
                    <p className="text-4xl font-mono text-orange-400">{state?.previewInput || '--'}</p>
                </div>
            </div>

            {/* Main Bus Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => sendCommand({ type: 'VMIX_CUT' })}
                    disabled={isPending}
                    className="flex-1 bg-stone-900 border border-stone-800 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 text-stone-400 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group"
                >
                    <Zap size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Cut</span>
                </button>

                <button
                    onClick={() => sendCommand({ type: 'VMIX_FADE', duration: 500 })}
                    disabled={isPending}
                    className="flex-1 bg-stone-900 border border-stone-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-500 text-stone-400 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group"
                >
                    <Repeat size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Fade</span>
                </button>
            </div>

            {/* Input Grid (Simplified Example) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-300 font-semibold text-sm">
                    <Grid size={18} className="text-indigo-400" />
                    <span>Quick Select Inputs</span>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((input) => (
                        <button
                            key={input}
                            onClick={() => sendCommand({ type: 'VMIX_SELECT_INPUT', payload: { input } })}
                            disabled={isPending}
                            className={`aspect-square rounded-lg border flex items-center justify-center font-mono text-sm transition-all ${state?.activeInput === input
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : state?.previewInput === input
                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                        : 'bg-stone-950 border-stone-800 text-stone-600 hover:border-stone-700 hover:text-stone-400'
                                }`}
                        >
                            {input}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
