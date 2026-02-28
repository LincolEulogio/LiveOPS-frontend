'use client';

import { useHardware } from '@/features/hardware/hooks/useHardware';
import { useAutomation } from '@/features/automation/hooks/useAutomation';
import { useHardwareMappings } from '@/features/hardware/hooks/useHardwareMappings';
import { useSocket } from '@/shared/socket/socket.provider';
import { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  X,
  Keyboard,
  RadioReceiver,
  Zap,
  Loader2,
  ArrowRight,
  Activity,
  Trash2,
  Cpu,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  productionId: string;
}

export const HardwareManager = ({ productionId }: Props) => {
  const { devices, lastEvent, error, requestHIDDevice, clearLastEvent } = useHardware();
  const { rules } = useAutomation(productionId);
  const { mappings, saveMapping, deleteMapping, isLoading } = useHardwareMappings(productionId);
  const { socket } = useSocket();

  const [isAssigning, setIsAssigning] = useState(false);

  // Listen for mapped key presses to trigger rules via Socket
  useEffect(() => {
    if (lastEvent && lastEvent.state === 'pressed' && !isAssigning && socket) {
      const mapKey = `${lastEvent.type}:${lastEvent.key}`;
      const mapping = mappings.find((m) => m.mapKey === mapKey);

      if (mapping) {
        console.log(`Emitting hardware trigger for mapKey: ${mapKey}`);
        socket.emit('hardware.trigger', {
          productionId,
          mapKey,
        });
        clearLastEvent();
      }
    }
  }, [lastEvent, isAssigning, mappings, socket, productionId, clearLastEvent]);

  const handleAssign = async (ruleId: string) => {
    if (!lastEvent) return;
    const mapKey = `${lastEvent.type}:${lastEvent.key}`;
    try {
      await saveMapping({ mapKey, ruleId });
      setIsAssigning(false);
      clearLastEvent();
    } catch (e) {
      console.error('Failed to save mapping:', e);
    }
  };

  const handleRemoveMapping = async (mapKey: string) => {
    try {
      await deleteMapping(mapKey);
    } catch (e) {
      console.error('Failed to delete mapping:', e);
    }
  };

  const manualMacros = rules.filter(
    (r) => r.isEnabled && r.triggers.some((t) => t.eventType === 'manual.trigger')
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-card-bg/40 backdrop-blur-xl border border-card-border rounded-[2.5rem] ">
        <div className="relative mb-6">
          <Loader2 size={48} className="animate-spin text-indigo-500 opacity-20" />
          <Cpu size={24} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-muted uppercase ">Synchronizing Registry</p>
        <p className="text-[9px] font-bold text-muted/40 uppercase  mt-2">
          Connecting to physical hardware bridge
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device List - Premium Surface */}
        <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10  relative overflow-hidden group/devices">
          {/* Tactical Scanline */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-500/20 ">
                <Keyboard className="text-indigo-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-[10px] sm:text-xs font-black text-foreground uppercase  leading-none mb-1 sm:mb-1.5">
                  Connected Nodes
                </h2>
                <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase  flex items-center gap-1.5 sm:gap-2">
                  <Activity className="text-emerald-500 w-[9px] h-[9px] sm:w-2.5 sm:h-2.5" />
                  Active Signal
                </span>
              </div>
            </div>
            <div className="px-2.5 sm:px-3 py-1 bg-white/5 border border-white/5 rounded-full shrink-0">
              <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase ">
                {devices.length} Nodes
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] sm:text-[10px] font-black uppercase  p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-6   animate-pulse">
              <span className="flex items-center gap-2 sm:gap-3">
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {error}
              </span>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {devices.length === 0 ? (
              <div className="p-8 sm:p-12 border-2 border-dashed border-card-border/60 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center opacity-40 group-hover/devices:opacity-60 transition-opacity">
                <RadioReceiver className="w-8 h-8 sm:w-10 sm:h-10 text-muted mb-3 sm:mb-4 stroke-[1px]" />
                <p className="text-[9px] sm:text-[10px] font-black text-muted uppercase ">
                  No devices located
                </p>
                <p className="text-[8px] sm:text-[9px] font-bold text-muted uppercase  mt-1">
                  Awaiting Link
                </p>
              </div>
            ) : (
              devices.map((d) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={d.id}
                  className="flex justify-between items-center p-4 sm:p-5 bg-background/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-card-border/60  hover:border-indigo-500/30 transition-all group/item"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center  border border-white/5',
                        d.type === 'hid'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      )}
                    >
                      {d.type === 'hid' ? (
                        <Keyboard className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      ) : (
                        <RadioReceiver className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12px] sm:text-sm font-black text-foreground uppercase  leading-none truncate block">
                        {d.name}
                      </span>
                      <p className="text-[8px] sm:text-[9px] font-bold text-muted uppercase  mt-1 sm:mt-1.5 opacity-60">
                        ID: {d.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-[8px] font-black text-muted uppercase  opacity-40">
                      Healthy
                    </span>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500  animate-pulse" />
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button
            onClick={requestHIDDevice}
            className="w-full py-4 sm:py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase  transition-all flex justify-center items-center gap-2 sm:gap-3   active:scale-[0.98] group"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform" />
            Pair HID Interface
          </button>
          <p className="text-[8px] sm:text-[9px] font-bold text-muted/60 mt-3 sm:mt-4 text-center uppercase ">
            Connect physical controllers for direct production access.
          </p>
        </div>

        {/* Logic Bridge Surface */}
        <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10  relative overflow-hidden flex flex-col group/bridge">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent animate-pulse" />

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-amber-500/20 ">
                <Zap className="text-amber-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-[10px] sm:text-xs font-black text-foreground uppercase  leading-none mb-1 sm:mb-1.5">
                  Logic Mappings
                </h2>
                <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase  flex items-center gap-1.5 sm:gap-2">
                  <Settings className="text-amber-500 w-[9px] h-[9px] sm:w-2.5 sm:h-2.5" />
                  Persistence Layer
                </span>
              </div>
            </div>
            <div className="px-2.5 sm:px-3 py-1 bg-white/5 border border-white/5 rounded-full shrink-0">
              <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase ">
                {mappings.length} Bound
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[350px] pr-2">
            <AnimatePresence mode="popLayout">
              {mappings.map((mapping) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={mapping.id}
                  className="flex justify-between items-center p-4 bg-background/40 backdrop-blur-md rounded-2xl border border-card-border/60  group/map-item hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="px-3 py-1.5 bg-background border border-card-border rounded-lg text-[9px] font-black font-mono text-indigo-400 uppercase  ">
                      {mapping.mapKey}
                    </div>
                    <ArrowRight className="text-muted/40 group-hover/map-item:translate-x-1 transition-transform w-[14px] h-[14px]" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black text-foreground uppercase  truncate max-w-[140px]">
                        {mapping.rule?.name || 'Undefined Protocol'}
                      </span>
                      <p className="text-[8px] font-bold text-muted uppercase  mt-1">
                        Primary Macro
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMapping(mapping.mapKey)}
                    className="p-2.5 bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {mappings.length === 0 && (
              <div className="p-12 border-2 border-dashed border-card-border/60 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 group-hover/bridge:opacity-60 transition-opacity">
                <Zap className="text-muted mb-4 stroke-[1px] w-10 h-10" />
                <p className="text-[10px] font-black text-muted uppercase ">Matrix Unpopulated</p>
                <p className="text-[9px] font-bold text-muted uppercase  mt-1">
                  Bind physical input to logical macros
                </p>
              </div>
            )}
          </div>

          {/* Matrix Binder Mode */}
          <div className="mt-8 pt-8 border-t border-card-border/50">
            {!isAssigning ? (
              <button
                onClick={() => setIsAssigning(true)}
                className="w-full py-5 bg-background/50 hover:bg-white/5 border border-dashed border-card-border rounded-2xl text-[10px] font-black text-muted hover:text-indigo-400 hover:border-indigo-500/50 transition-all uppercase   font-mono"
              >
                + Initialize New Binding
              </button>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-4xl text-center  relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-30 animate-pulse pointer-events-none" />

                  {!lastEvent ? (
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center animate-bounce">
                        <Keyboard className="text-indigo-400 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-foreground uppercase ">
                          Passive Listening...
                        </p>
                        <p className="text-[9px] font-bold text-muted uppercase  mt-2 px-6">
                          Press any physical button on your surface to capture the intercept key
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-indigo-400 uppercase  opacity-60">
                          Intercept Identification:
                        </p>
                        <div className="inline-block px-5 py-3 bg-indigo-600 border border-indigo-500 text-white font-mono text-xs font-black rounded-xl   uppercase ">
                          {lastEvent.type} <span className="mx-2 opacity-50">::</span>{' '}
                          {lastEvent.key}
                        </div>
                      </div>

                      <div className="text-left mt-8 pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase  text-muted mb-4 px-2">
                          Select Target Macro Protocol:
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-3">
                          {manualMacros.length === 0 ? (
                            <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                              <p className="text-[10px] font-black text-muted uppercase ">
                                No Manual Macros Primed
                              </p>
                              <p className="text-[8px] font-bold text-muted/40 uppercase  mt-1">
                                Create an automation with a manual trigger first
                              </p>
                            </div>
                          ) : (
                            manualMacros.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => handleAssign(m.id)}
                                className="w-full text-left px-5 py-4 bg-background/40 hover:bg-white/5 border border-card-border/60 hover:border-indigo-500/30 rounded-2xl transition-all group/macro "
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-foreground uppercase  group-hover/macro:text-indigo-400 transition-colors">
                                      {m.name}
                                    </span>
                                    <p className="text-[8px] font-bold text-muted uppercase  mt-1 italic">
                                      Authorized Logic ID: {m.id.slice(0, 6)}
                                    </p>
                                  </div>
                                  <Plus className="w-3.5 h-3.5 text-muted group-hover/macro:text-indigo-400 opacity-0 group-hover/macro:opacity-100 transition-all group-hover/macro:scale-125" />
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsAssigning(false);
                    clearLastEvent();
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-red-500/10 border border-white/5 text-[10px] font-black text-muted hover:text-red-400 rounded-2xl transition-all uppercase "
                >
                  Abort Operation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
