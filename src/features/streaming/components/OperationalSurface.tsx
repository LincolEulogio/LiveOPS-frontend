'use client';

import React from 'react';
import {
    Monitor,
    Layers,
    Activity,
    ChevronRight,
    Play,
    Square,
    Mic2,
    Volume2,
    VolumeX,
    Layout,
    Camera,
    Repeat,
    Zap
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { StreamingCommand, ObsState, VmixState } from '../types/streaming.types';

interface OperationalSurfaceProps {
    productionId: string;
    engineType: 'OBS' | 'VMIX';
    state?: any; // ObsState | VmixState
    sendCommand: (command: StreamingCommand) => void;
    isPending: boolean;
    isDisconnected: boolean;
}

export const OperationalSurface: React.FC<OperationalSurfaceProps> = ({
    productionId,
    engineType,
    state,
    sendCommand,
    isPending,
    isDisconnected
}) => {
    if (isDisconnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-red-500/5 rounded-[2rem] border border-red-500/10 backdrop-blur-md">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Activity className="text-red-400" size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Engine Link Severed</h3>
                    <p className="text-muted font-medium text-[10px] max-w-xs mb-6 uppercase leading-relaxed opacity-60">
                        Verify your {engineType} WebSocket/API credentials and ensure the application is running.
                    </p>
                    <div className="flex justify-center">
                        <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase text-red-500 animate-pulse">
                            Establishing Proxy Recon...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Simulated Preview/Program Scenes for Demo
    // In a real app, these would come from OBS preview/program state
    const currentProgram = engineType === 'OBS'
        ? state?.currentScene
        : (state?.inputs?.find((i: any) => i.number === state?.activeInput)?.title || `Input ${state?.activeInput || 1}`);

    const currentPreview = engineType === 'OBS'
        ? 'Preview Scene'
        : (state?.inputs?.find((i: any) => i.number === state?.previewInput)?.title || `Input ${state?.previewInput || 2}`);

    return (
        <div className="flex flex-col gap-8">
            {/* 1. Multiview Simulation Layer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px] sm:h-[350px]">
                {/* Preview Monitor */}
                <div className="relative group rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-card-bg/40 backdrop-blur-md">
                    <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
                        <div className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-lg">Preview</div>
                        <span className="text-[10px] font-bold text-white/80 uppercase truncate max-w-[200px]">{currentPreview}</span>
                    </div>
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]">
                        <Camera size={48} className="text-muted/20" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-400 uppercase">
                            <Activity size={10} /> Standby Ready
                        </div>
                    </div>
                </div>

                {/* Program Monitor */}
                <div className="relative group rounded-3xl overflow-hidden border-2 border-red-500/40 bg-card-bg/40 backdrop-blur-md">
                    <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
                        <div className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg animate-pulse">Program</div>
                        <span className="text-[10px] font-bold text-white/80 uppercase truncate max-w-[200px]">{currentProgram}</span>
                    </div>
                    {/* Simulated Content Base64 if we had it, for now placeholder */}
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]">
                        <Monitor size={48} className="text-muted/20" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-red-400 uppercase">
                            <Activity size={10} /> Live Output
                        </div>
                        <div className="text-[10px] font-black tracking-widest">{new Date().toLocaleTimeString([], { hour12: false })}</div>
                    </div>
                </div>
            </div>

            {/* 2. Control Matrix & Audio Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Scene Matrix (8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-card-border/40 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Layers size={16} />
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Scene Matrix</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-muted uppercase">{engineType === 'OBS' ? state?.scenes?.length || 0 : (state?.inputs?.length || 8)} Active Inputs</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {engineType === 'OBS' ? (
                            state?.scenes?.map((scene: string) => (
                                <button
                                    key={scene}
                                    onClick={() => sendCommand({ type: 'CHANGE_SCENE', sceneName: scene })}
                                    disabled={isPending}
                                    className={cn(
                                        "group relative h-20 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all overflow-hidden active:scale-95",
                                        state.currentScene === scene
                                            ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20"
                                            : "bg-background/40 border-card-border text-muted-foreground hover:border-indigo-500/50 hover:text-foreground"
                                    )}
                                >
                                    <span className="text-[10px] font-black uppercase truncate w-full text-center px-2">{scene}</span>
                                    {state.currentScene === scene && (
                                        <div className="absolute top-1 right-2 flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            // Actual vMix Inputs
                            (state?.inputs || Array.from({ length: 8 })).map((input: any, i: number) => {
                                const inputNum = input?.number || (i + 1);
                                const inputTitle = input?.title || `Input ${inputNum}`;
                                const isActive = state?.activeInput === inputNum;
                                const isPreview = state?.previewInput === inputNum;

                                return (
                                    <button
                                        key={inputNum}
                                        onClick={() => sendCommand({ type: 'VMIX_SELECT_INPUT', payload: { input: inputNum } })}
                                        disabled={isPending}
                                        className={cn(
                                            "group relative h-20 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all overflow-hidden active:scale-95",
                                            isActive
                                                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20"
                                                : isPreview
                                                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                    : "bg-background/40 border-card-border text-muted-foreground hover:border-indigo-500/50 hover:text-foreground"
                                        )}
                                    >
                                        <div className="absolute top-2 left-3 bg-black/20 px-1.5 rounded text-[8px] font-bold">{inputNum}</div>
                                        <span className="text-[10px] font-black uppercase truncate w-full text-center px-1">{inputTitle}</span>
                                        {(isActive || isPreview) && (
                                            <div className="absolute bottom-1.5 inset-x-4 h-0.5 bg-white/40 rounded-full" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Transport & Audio (4/12) */}
                <div className="lg:col-span-4 space-y-8 h-full flex flex-col">
                    {/* Transition Controls (vMix Only / Enhanced) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-card-border/40 pb-4">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                <Zap size={16} />
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Transition Hub</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => sendCommand({ type: 'VMIX_CUT' })}
                                disabled={isPending || engineType !== 'VMIX'}
                                className="flex-1 py-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl border border-red-400/50 font-black text-xs uppercase transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-20 flex flex-col items-center gap-2"
                            >
                                <Zap size={20} fill="currentColor" />
                                Instant Cut
                            </button>
                            <button
                                onClick={() => sendCommand({ type: 'VMIX_FADE', duration: 500 })}
                                disabled={isPending || engineType !== 'VMIX'}
                                className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl border border-indigo-400/50 font-black text-xs uppercase transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-20 flex flex-col items-center gap-2"
                            >
                                <Repeat size={20} />
                                Auto Fade
                            </button>
                        </div>
                    </div>

                    {/* Simplified Transport */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-card-border/40 pb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Activity size={16} />
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Master Feed</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => sendCommand({ type: state?.isStreaming ? 'STOP_STREAM' : 'START_STREAM' })}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase transition-all flex flex-col items-center gap-2",
                                    state?.isStreaming ? "bg-red-600 text-white border-red-500" : "bg-card-bg border-card-border text-muted hover:text-emerald-500 hover:border-emerald-500/50"
                                )}
                            >
                                {state?.isStreaming ? <Square size={16} /> : <Play size={16} />}
                                {state?.isStreaming ? 'Stop Life' : 'Go Live'}
                            </button>
                            <button
                                onClick={() => sendCommand({ type: state?.isRecording ? 'STOP_RECORD' : 'START_RECORD' })}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase transition-all flex flex-col items-center gap-2",
                                    state?.isRecording ? "bg-indigo-600 text-white border-indigo-400" : "bg-card-bg border-card-border text-muted hover:text-indigo-500 hover:border-indigo-500/50"
                                )}
                            >
                                {state?.isRecording ? <Square size={16} /> : <Play size={16} />}
                                {state?.isRecording ? 'Stop Rec' : 'Start Rec'}
                            </button>
                        </div>
                    </div>

                    {/* Audio Bridge Simulation */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 border-b border-card-border/40 pb-4">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                <Volume2 size={16} />
                            </div>
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Audio Bridge</span>
                        </div>

                        <div className="space-y-4 bg-background/40 border border-card-border rounded-2xl p-4">
                            <div className="flex gap-4 h-32">
                                <div className="w-8 bg-background rounded-full border border-card-border p-1 flex flex-col justify-end relative overflow-hidden group/fader">
                                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-red-500/10" />
                                    <div className="absolute top-1/4 left-0 right-0 h-1/4 bg-amber-500/10" />
                                    {/* Simulated Fader Cap */}
                                    <div className="z-10 bg-indigo-500 w-full h-8 rounded-full border-2 border-white/20 cursor-pointer shadow-lg transform translate-y-[-20px] active:scale-95 transition-all" />
                                    {/* Level Meter Background */}
                                    <div className="absolute bottom-1 left-1 right-1 bg-emerald-500/40 rounded-full" style={{ height: '65%' }} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-foreground uppercase italic">Master Output</p>
                                        <p className="text-[8px] font-bold text-muted uppercase">Digital AES/EBU Bridge</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                            <VolumeX size={14} />
                                        </button>
                                        <div className="flex-1 flex items-center gap-1">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} className={cn("w-1 h-4 rounded-full bg-card-border", i < 5 && "bg-emerald-500/50 animate-pulse")} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
