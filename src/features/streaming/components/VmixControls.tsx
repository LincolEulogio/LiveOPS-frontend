'use client';

import { useState } from 'react';
import { VmixState, StreamingCommand } from '../types/streaming.types';
import { Play, Repeat, Zap, ZapOff, Grid, AlertCircle } from 'lucide-react';

import Link from 'next/link';

interface VmixControlsProps {
    productionId: string;
    state?: VmixState;
    sendCommand: (command: StreamingCommand) => void;
    isPending: boolean;
    isDisconnected: boolean;
}

export function VmixControls({ productionId, state, sendCommand, isPending, isDisconnected }: VmixControlsProps) {
    const [fadeDuration, setFadeDuration] = useState(500);

    if (isDisconnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <AlertCircle className="text-stone-700" size={48} />
                <div className="space-y-1">
                    <h3 className="text-stone-400 font-semibold">vMix Disconnected</h3>
                    <p className="text-stone-600 text-sm max-w-xs mb-4">
                        Verify your vMix Web Controller settings and ensure vMix is running on the target machine.
                    </p>
                    <Link
                        href={`/productions/${productionId}/edit`}
                        className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Configure Connection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${state?.isStreaming ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${state?.isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-stone-700'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Streaming</span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${state?.isRecording ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${state?.isRecording ? 'bg-red-500 animate-pulse' : 'bg-stone-700'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Recording</span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${state?.isExternal ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${state?.isExternal ? 'bg-indigo-500 animate-pulse' : 'bg-stone-700'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">External</span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${state?.isMultiCorder ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${state?.isMultiCorder ? 'bg-blue-500 animate-pulse' : 'bg-stone-700'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">MultiCorder</span>
                </div>
            </div>

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
            <div className="space-y-4">
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
                        onClick={() => sendCommand({ type: 'VMIX_FADE', duration: fadeDuration })}
                        disabled={isPending}
                        className="flex-1 bg-stone-900 border border-stone-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-500 text-stone-400 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all group"
                    >
                        <Repeat size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Fade</span>
                    </button>
                </div>

                <div className="bg-stone-950/50 border border-stone-800/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Fade Duration</label>
                            <span className="text-[10px] font-mono text-indigo-400">{fadeDuration}ms</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={fadeDuration}
                            onChange={(e) => setFadeDuration(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                </div>
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
