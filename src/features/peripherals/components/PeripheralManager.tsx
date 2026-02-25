'use client';

import React from 'react';
import { useStreamDeck } from '@/features/peripherals/hooks/useStreamDeck';
import { useMidi } from '@/features/peripherals/hooks/useMidi';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import {
    Cpu, Monitor, Music, Signal,
    Settings, Power, AlertCircle,
    Zap, ArrowRight
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

interface PeripheralManagerProps {
    productionId: string;
}

export const PeripheralManager = ({ productionId }: PeripheralManagerProps) => {
    const { blocks, startBlock, completeBlock } = useTimeline(productionId);

    // 1. Stream Deck Integration
    const {
        isConnected: isStreamDeckConnected,
        connect: connectStreamDeck,
        disconnect: disconnectStreamDeck,
        deviceName: streamDeckName
    } = useStreamDeck((index) => {
        console.log(`Stream Deck Key Pressed: ${index}`);
        // Map key 0 to "Smart Next" logic
        if (index === 0) {
            handleSmartNext();
        }
    });

    // 2. MIDI Integration
    const {
        isConnected: isMidiConnected,
        inputs: midiInputs
    } = useMidi((msg) => {
        console.log('MIDI Message:', msg);
        // Map Note 60 (Middle C) to Smart Next
        if (msg.command === 144 && msg.note === 60 && msg.velocity > 0) {
            handleSmartNext();
        }
    });

    const handleSmartNext = async () => {
        const activeBlock = blocks.find(b => b.status === 'ACTIVE');
        const nextBlock = blocks.find(b => b.status === 'PENDING');

        if (!nextBlock) return;

        try {
            if (activeBlock) {
                await completeBlock(activeBlock.id);
            }
            await startBlock(nextBlock.id);
            toast.success(`Smart Next: ${nextBlock.title}`);
        } catch (err) {
            console.error('Peripheral Smart Next failed:', err);
        }
    };

    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-foreground">
                    <Cpu className="text-indigo-400" size={20} />
                    <h2 className="text-lg font-semibold uppercase ">Peripherals</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        (isStreamDeckConnected || isMidiConnected) ? "bg-emerald-500 animate-pulse" : "bg-stone-700"
                    )} />
                </div>
            </div>

            <div className="space-y-4">
                {/* Stream Deck Section */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    isStreamDeckConnected ? "bg-indigo-500/5 border-indigo-500/30" : "bg-background border-card-border"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Monitor size={16} className={isStreamDeckConnected ? "text-indigo-400" : "text-muted"} />
                            <span className="text-xs font-bold text-foreground uppercase ">Stream Deck</span>
                        </div>
                        {isStreamDeckConnected ? (
                            <button
                                onClick={disconnectStreamDeck}
                                className="p-1 px-2 bg-card-border hover:bg-red-500 text-[10px] font-bold text-muted hover:text-white rounded-lg transition-all"
                            >
                                DISCONNECT
                            </button>
                        ) : (
                            <button
                                onClick={connectStreamDeck}
                                className="p-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
                            >
                                CONNECT
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted">
                            {isStreamDeckConnected ? streamDeckName : 'Not Detected'}
                        </span>
                        {isStreamDeckConnected && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 rounded text-[9px] font-black text-indigo-400">
                                <Zap size={10} />
                                MAPPED: KEY 1 → NEXT
                            </div>
                        )}
                    </div>
                </div>

                {/* MIDI Section */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    isMidiConnected ? "bg-emerald-500/5 border-emerald-500/30" : "bg-background border-card-border"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Music size={16} className={isMidiConnected ? "text-emerald-400" : "text-muted"} />
                            <span className="text-xs font-bold text-foreground uppercase ">MIDI Controller</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {midiInputs.length > 0 ? (
                            midiInputs.map(input => (
                                <div key={input.id} className="flex items-center justify-between bg-card-bg/50 p-2 rounded-lg border border-card-border">
                                    <span className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{input.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-emerald-500">LISTENING</span>
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-2 opacity-40">
                                <AlertCircle size={14} className="text-muted" />
                                <span className="text-[10px] font-bold text-muted uppercase">No MIDI devices linked</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-card-border">
                <p className="text-[10px] text-muted font-medium leading-relaxed">
                    Hardware triggers are mapped to your current production controls.
                    Ensure you have given browser permissions for HID and MIDI.
                </p>
            </div>
        </div>
    );
};
