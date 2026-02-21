'use client';

// Refresh trigger
import { ObsState, StreamingCommand } from '@/features/streaming/types/streaming.types';
import { Play, Square, Video, Settings, Layers, AlertCircle } from 'lucide-react';

import Link from 'next/link';

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
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <AlertCircle className="text-stone-700" size={48} />
                <div className="space-y-1">
                    <h3 className="text-stone-400 font-semibold">OBS Disconnected</h3>
                    <p className="text-stone-600 text-sm max-w-xs mb-4">
                        Verify your OBS WebSocket settings (URL, Port, Password) and ensure OBS is running.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scene Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-300 font-semibold text-sm">
                    <Layers size={18} className="text-indigo-400" />
                    <span>Program Scenes</span>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {state?.scenes?.map((scene) => (
                        <button
                            key={scene}
                            onClick={() => sendCommand({ type: 'CHANGE_SCENE', sceneName: scene })}
                            disabled={isPending}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${state.currentScene === scene
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-white'
                                }`}
                        >
                            <span className="text-sm font-medium">{scene}</span>
                            {state.currentScene === scene && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>
                    ))}
                    {!state?.scenes?.length && (
                        <p className="text-stone-600 text-xs italic p-4 text-center border border-dashed border-stone-800 rounded-xl">
                            No scenes discovered yet...
                        </p>
                    )}
                </div>
            </div>

            {/* Transport Controls */}
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-300 font-semibold text-sm">
                        <Video size={18} className="text-indigo-400" />
                        <span>Streaming & Recording</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => sendCommand({ type: state?.isStreaming ? 'STOP_STREAM' : 'START_STREAM' })}
                            disabled={isPending}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all space-y-3 ${state?.isStreaming
                                ? 'bg-red-500/10 border-red-500/50 text-red-500'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5'
                                }`}
                        >
                            {state?.isStreaming ? <Square size={24} /> : <Play size={24} />}
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {state?.isStreaming ? 'Stop Stream' : 'Start Stream'}
                            </span>
                        </button>

                        <button
                            onClick={() => sendCommand({ type: state?.isRecording ? 'STOP_RECORD' : 'START_RECORD' })}
                            disabled={isPending}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all space-y-3 ${state?.isRecording
                                ? 'bg-red-500/10 border-red-500/50 text-red-500'
                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/5'
                                }`}
                        >
                            {state?.isRecording ? <Square size={24} /> : <Play size={24} />}
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {state?.isRecording ? 'Stop Rec' : 'Start Rec'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats placeholder */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">FPS</p>
                        <p className="text-xl font-mono text-stone-300">{state?.fps || '--'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">CPU</p>
                        <p className="text-xl font-mono text-stone-300">{state?.cpuUsage?.toFixed(1) || '--'}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
