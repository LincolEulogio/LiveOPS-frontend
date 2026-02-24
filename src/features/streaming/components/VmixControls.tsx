'use client';

import { useState } from 'react';
import { VmixState, StreamingCommand } from '../types/streaming.types';
import { Play, Repeat, Zap, ZapOff, Grid, AlertCircle, Radio, Activity, Monitor } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

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
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-red-500/5 rounded-[2rem] border border-red-500/10 backdrop-blur-md">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-400" size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Engine Offline</h3>
                    <p className="text-muted font-medium text-xs max-w-xs mb-6 uppercase tracking-wider leading-relaxed">
                        Verify your vMix Web Controller API settings and ensure vMix is running on the target machine.
                    </p>
                    <Link
                        href={`/productions/${productionId}/edit`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                        Repair Link
                    </Link>
                </div>
            </div>
        );
    }

    const StatItem = ({ label, value, active, colorClass }: { label: string, value: string, active: boolean, colorClass: string }) => (
        <div className={cn(
            "px-4 py-2.5 rounded-xl border flex items-center gap-3 transition-all flex-1 min-w-[140px]",
            active ? `${colorClass} shadow-lg` : "bg-card-bg/40 border-card-border/50 text-muted opacity-60"
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", active ? "animate-pulse bg-current" : "bg-muted")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Intelligent Status Indicators */}
            <div className="flex flex-wrap gap-3">
                <StatItem label="Streaming" value="Live" active={!!state?.isStreaming} colorClass="bg-emerald-500/10 border-emerald-500/30 text-emerald-500" />
                <StatItem label="Recording" value="Rec" active={!!state?.isRecording} colorClass="bg-red-500/10 border-red-500/30 text-red-500" />
                <StatItem label="External" value="Ext" active={!!state?.isExternal} colorClass="bg-indigo-500/10 border-indigo-500/30 text-indigo-500" />
                <StatItem label="Multicorder" value="MC" active={!!state?.isMultiCorder} colorClass="bg-blue-500/10 border-blue-500/30 text-blue-500" />
            </div>

            {/* Bus Monitor Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group relative bg-background/50 border border-card-border p-6 rounded-3xl overflow-hidden transition-all hover:bg-background shadow-inner">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Monitor size={60} />
                    </div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">Program Bus</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-500 tracking-tighter">{state?.activeInput || '--'}</span>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Input</span>
                    </div>
                    <div className="mt-4 h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-1/3 h-full bg-emerald-500"
                        />
                    </div>
                </div>

                <div className="group relative bg-background/50 border border-card-border p-6 rounded-3xl overflow-hidden transition-all hover:bg-background shadow-inner">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Monitor size={60} />
                    </div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3">Preview Bus</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-orange-400 tracking-tighter">{state?.previewInput || '--'}</span>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Standby Input</span>
                    </div>
                    <div className="mt-4 h-1 w-full bg-orange-400/20 rounded-full" />
                </div>
            </div>

            {/* Tactical Control Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Zap size={16} />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Transition Surface</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => sendCommand({ type: 'VMIX_CUT' })}
                            disabled={isPending}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-[2rem] p-8 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-600/20 border border-red-500/50"
                        >
                            <Zap size={32} fill="currentColor" />
                            <span className="text-xs font-black uppercase tracking-widest">Instant Cut</span>
                        </button>

                        <button
                            onClick={() => sendCommand({ type: 'VMIX_FADE', duration: fadeDuration })}
                            disabled={isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] p-8 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 border border-indigo-500/50"
                        >
                            <Repeat size={32} />
                            <span className="text-xs font-black uppercase tracking-widest">Auto Fade</span>
                        </button>
                    </div>

                    <div className="bg-card-bg/40 backdrop-blur-md border border-card-border/50 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Fade Interval</label>
                            <span className="px-3 py-1 bg-indigo-500/10 rounded-lg text-xs font-black text-indigo-400 tracking-tighter">{fadeDuration}ms</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={fadeDuration}
                            onChange={(e) => setFadeDuration(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                </div>

                {/* Tactical Input Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Grid size={16} />
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Input Navigator</span>
                        </div>
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">16 Active Nodes</span>
                    </div>

                    <div className="grid grid-cols-4 xs:grid-cols-5 md:grid-cols-4 xl:grid-cols-8 gap-2.5">
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((input) => (
                            <button
                                key={input}
                                onClick={() => sendCommand({ type: 'VMIX_SELECT_INPUT', payload: { input } })}
                                disabled={isPending}
                                className={cn(
                                    "aspect-square rounded-xl border flex items-center justify-center font-black text-xs transition-all active:scale-90 relative overflow-hidden",
                                    state?.activeInput === input
                                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                                        : state?.previewInput === input
                                            ? "bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse"
                                            : "bg-background border-card-border text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {input}
                                {state?.activeInput === input && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
