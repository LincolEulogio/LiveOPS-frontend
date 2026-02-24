'use client';

import { ObsState, StreamingCommand } from '@/features/streaming/types/streaming.types';
import { Play, Square, Video, Settings, Layers, AlertCircle, Activity, Layout, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

interface ObsControlsProps {
    productionId: string;
    state?: ObsState;
    sendCommand: (command: StreamingCommand) => void;
    isPending: boolean;
    isDisconnected: boolean;
}

export function ObsControls({ productionId, state, sendCommand, isPending, isDisconnected }: ObsControlsProps) {
    if (isDisconnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-red-500/5 rounded-[2rem] border border-red-500/10 backdrop-blur-md">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-400" size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Connection Offline</h3>
                    <p className="text-muted font-medium text-xs max-w-xs mb-6 uppercase tracking-wider leading-relaxed">
                        Verify your OBS WebSocket credentials and ensure the application is running.
                    </p>
                    <Link
                        href={`/productions/${productionId}/edit`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                        Repair Connection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Scene Selection */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Layers size={16} />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Scene Matrix</span>
                    </div>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">{state?.scenes?.length || 0} Scenes</span>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {state?.scenes?.map((scene) => (
                        <button
                            key={scene}
                            onClick={() => sendCommand({ type: 'CHANGE_SCENE', sceneName: scene })}
                            disabled={isPending}
                            className={cn(
                                "group relative w-full flex items-center justify-between p-4 rounded-2xl border transition-all overflow-hidden",
                                state.currentScene === scene
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
                                    : "bg-background border-card-border text-muted hover:border-indigo-500/50 hover:text-foreground hover:bg-white/5 active:scale-[0.99]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-1.5 h-6 rounded-full transition-all",
                                    state.currentScene === scene ? "bg-white" : "bg-card-border group-hover:bg-indigo-500/50"
                                )} />
                                <span className="text-xs font-black uppercase tracking-tight">{scene}</span>
                            </div>

                            {state.currentScene === scene ? (
                                <Activity size={14} className="text-white animate-pulse" />
                            ) : (
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            )}
                        </button>
                    ))}
                    {!state?.scenes?.length && (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-card-border rounded-3xl opacity-40">
                            <Layout size={32} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No scenes detected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Transport & Stats */}
            <div className="space-y-8 flex flex-col">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Video size={16} />
                        </div>
                        <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Transport Control</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                        <button
                            onClick={() => sendCommand({ type: state?.isStreaming ? 'STOP_STREAM' : 'START_STREAM' })}
                            disabled={isPending}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 rounded-3xl border transition-all gap-4 shadow-lg active:scale-95 group",
                                state?.isStreaming
                                    ? "bg-red-500 border-red-400 text-white shadow-red-500/20"
                                    : "bg-background border-card-border text-muted hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                state?.isStreaming ? "bg-white/20" : "bg-emerald-500/10 group-hover:bg-emerald-500/20"
                            )}>
                                {state?.isStreaming ? <Square size={24} /> : <Play size={24} className="ml-1" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {state?.isStreaming ? 'Stop Broadcast' : 'Start Broadcast'}
                            </span>
                        </button>

                        <button
                            onClick={() => sendCommand({ type: state?.isRecording ? 'STOP_RECORD' : 'START_RECORD' })}
                            disabled={isPending}
                            className={cn(
                                "flex flex-col items-center justify-center p-8 rounded-3xl border transition-all gap-4 shadow-lg active:scale-95 group",
                                state?.isRecording
                                    ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/20"
                                    : "bg-background border-card-border text-muted hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/5"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                state?.isRecording ? "bg-white/20" : "bg-indigo-500/10 group-hover:bg-indigo-500/20"
                            )}>
                                {state?.isRecording ? <Square size={24} /> : <Play size={24} className="ml-1" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                {state?.isRecording ? 'Stop Recording' : 'Start Recording'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Performance Stats Container */}
                <div className="mt-auto bg-background/50 border border-card-border rounded-2xl p-6 grid grid-cols-2 gap-6 group">
                    <div className="space-y-2 border-r border-card-border pr-6 transition-all group-hover:border-indigo-500/20">
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" /> Frequency
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-foreground tracking-tighter">{state?.fps || '--'}</p>
                            <span className="text-[10px] font-bold text-muted uppercase">FPS</span>
                        </div>
                    </div>
                    <div className="space-y-2 pl-2">
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" /> CPU Load
                        </div>
                        <div className="flex items-baseline gap-1">
                            <p className="text-3xl font-black text-foreground tracking-tighter">{state?.cpuUsage?.toFixed(1) || '--'}</p>
                            <span className="text-[10px] font-bold text-muted uppercase">%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
