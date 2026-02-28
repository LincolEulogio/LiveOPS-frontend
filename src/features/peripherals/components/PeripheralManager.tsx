'use client';

import React from 'react';
import { useStreamDeck } from '@/features/peripherals/hooks/useStreamDeck';
import { useMidi } from '@/features/peripherals/hooks/useMidi';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import {
  Cpu,
  Monitor,
  Music,
  Signal,
  Settings,
  Power,
  AlertCircle,
  Zap,
  ArrowRight,
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
    deviceName: streamDeckName,
  } = useStreamDeck((index) => {
    console.log(`Stream Deck Key Pressed: ${index}`);
    // Map key 0 to "Smart Next" logic
    if (index === 0) {
      handleSmartNext();
    }
  });

  // 2. MIDI Integration
  const { isConnected: isMidiConnected, inputs: midiInputs } = useMidi((msg) => {
    console.log('MIDI Message:', msg);
    // Map Note 60 (Middle C) to Smart Next
    if (msg.command === 144 && msg.note === 60 && msg.velocity > 0) {
      handleSmartNext();
    }
  });

  const handleSmartNext = async () => {
    const activeBlock = blocks.find((b) => b.status === 'ACTIVE');
    const nextBlock = blocks.find((b) => b.status === 'PENDING');

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
    <div className="bg-transparent space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 text-foreground">
          <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-500 shadow-lg shadow-indigo-500/5">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest leading-none mb-1">
              Peripherals
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
              Hardware Interface Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-500',
              isStreamDeckConnected || isMidiConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted-foreground/5 border-muted-foreground/10 text-muted-foreground/40'
            )}
          >
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isStreamDeckConnected || isMidiConnected
                  ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-muted-foreground/30'
              )}
            />
            {isStreamDeckConnected || isMidiConnected ? 'Online' : 'Scanning'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stream Deck Section */}
        <div
          className={cn(
            'p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group/sd shadow-inner',
            isStreamDeckConnected
              ? 'bg-indigo-600/5 border-indigo-500/30 dark:bg-indigo-500/5'
              : 'bg-background/40 border-card-border/50 hover:bg-background/60'
          )}
        >
          {isStreamDeckConnected && (
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/sd:opacity-[0.08] transition-opacity">
              <Monitor size={80} />
            </div>
          )}

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2.5 rounded-xl border transition-colors',
                  isStreamDeckConnected
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                    : 'bg-muted-foreground/5 border-muted-foreground/10 text-muted-foreground/40'
                )}
              >
                <Monitor size={18} />
              </div>
              <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                Stream Deck
              </span>
            </div>
            {isStreamDeckConnected ? (
              <button
                onClick={disconnectStreamDeck}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-[9px] font-black text-red-500 hover:text-white rounded-xl transition-all uppercase tracking-widest active:scale-95"
              >
                OFF
              </button>
            ) : (
              <button
                onClick={connectStreamDeck}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[9px] font-black text-white rounded-xl transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Connect
              </button>
            )}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                Status
              </span>
              <span
                className={cn(
                  'text-[11px] font-black uppercase tracking-tight',
                  isStreamDeckConnected
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground/40'
                )}
              >
                {isStreamDeckConnected ? streamDeckName : 'Not Detected'}
              </span>
            </div>
            {isStreamDeckConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[9px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm animate-in fade-in slide-in-from-right-4">
                <Zap size={10} className="animate-pulse" />
                MAPPED: KEY 1 → NEXT
              </div>
            )}
          </div>
        </div>

        {/* MIDI Section */}
        <div
          className={cn(
            'p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group/midi shadow-inner',
            isMidiConnected
              ? 'bg-emerald-600/5 border-emerald-500/30 dark:bg-emerald-500/5'
              : 'bg-background/40 border-card-border/50 hover:bg-background/60'
          )}
        >
          {isMidiConnected && (
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/midi:opacity-[0.08] transition-opacity">
              <Music size={80} />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div
              className={cn(
                'p-2.5 rounded-xl border transition-colors',
                isMidiConnected
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-muted-foreground/5 border-muted-foreground/10 text-muted-foreground/40'
              )}
            >
              <Music size={18} />
            </div>
            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
              MIDI Controller
            </span>
          </div>

          <div className="space-y-3 relative z-10">
            {midiInputs.length > 0 ? (
              midiInputs.map((input) => (
                <div
                  key={input.id}
                  className="flex items-center justify-between bg-white/3 dark:bg-black/20 p-3.5 rounded-2xl border border-card-border/50 shadow-sm group/input transition-all hover:border-emerald-500/30"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate max-w-[150px]">
                      {input.name}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">
                      Hardware Port
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 tracking-widest">
                      ARMED
                    </span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 bg-muted-foreground/5 dark:bg-black/10 rounded-2xl border border-dashed border-card-border/50">
                <div className="flex items-center gap-2 opacity-30">
                  <AlertCircle size={14} className="text-muted-foreground" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    No MIDI ports detected
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-5 bg-card-bg/20 rounded-2xl border border-card-border/20 relative overflow-hidden group/hint">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
        <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed uppercase tracking-tight">
          <span className="text-indigo-500 font-black mr-2">Info:</span>
          Hardware triggers are automatically mapped to primary production controls based on your
          logic configuration. Browser permissions for{' '}
          <span className="text-foreground/80 font-bold underline decoration-indigo-500/30">
            HID
          </span>{' '}
          and{' '}
          <span className="text-foreground/80 font-bold underline decoration-indigo-500/30">
            MIDI
          </span>{' '}
          must be authorized for telemetry.
        </p>
      </div>
    </div>
  );
};
