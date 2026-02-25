'use client';

import { useHardware } from '../hooks/useHardware';
import { useAutomation } from '@/features/automation/hooks/useAutomation';
import { useHardwareMappings } from '../hooks/useHardwareMappings';
import { useSocket } from '@/shared/socket/socket.provider';
import { useState, useEffect } from 'react';
import { Settings, Plus, X, Keyboard, RadioReceiver, Zap, Loader2, ArrowRight, Activity, Trash2, Cpu } from 'lucide-react';
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
            const mapping = mappings.find(m => m.mapKey === mapKey);

            if (mapping) {
                console.log(`Emitting hardware trigger for mapKey: ${mapKey}`);
                socket.emit('hardware.trigger', {
                    productionId,
                    mapKey
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

    const manualMacros = rules.filter(r => r.isEnabled && r.triggers.some(t => t.eventType === 'manual.trigger'));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-card-bg/40 backdrop-blur-xl border border-card-border rounded-[2.5rem] ">
                <div className="relative mb-6">
                    <Loader2 size={48} className="animate-spin text-indigo-500 opacity-20" />
                    <Cpu size={24} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-muted uppercase ">Synchronizing Registry</p>
                <p className="text-[9px] font-bold text-muted/40 uppercase  mt-2">Connecting to physical hardware bridge</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Device List - Premium Surface */}
                <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-8 md:p-10  relative overflow-hidden group/devices">
                    {/* Tactical Scanline */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-pulse" />

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 ">
                                <Keyboard size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-foreground uppercase  leading-none mb-1.5">Connected Nodes</h2>
                                <span className="text-[9px] font-black text-muted uppercase  flex items-center gap-2">
                                    <Activity size={10} className="text-emerald-500" />
                                    Active Signal
                                </span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                            <span className="text-[9px] font-black text-muted uppercase ">{devices.length} Devices</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase  p-4 rounded-2xl mb-6   animate-pulse">
                            <span className="flex items-center gap-3"><X size={14} /> {error}</span>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        {devices.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-card-border/60 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 group-hover/devices:opacity-60 transition-opacity">
                                <RadioReceiver size={40} className="text-muted mb-4 stroke-[1px]" />
                                <p className="text-[10px] font-black text-muted uppercase ">No automated devices located</p>
                                <p className="text-[9px] font-bold text-muted uppercase  mt-1">Ready for manual HID initialization</p>
                            </div>
                        ) : (
                            devices.map(d => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={d.id}
                                    className="flex justify-between items-center p-5 bg-background/40 backdrop-blur-md rounded-2xl border border-card-border/60  hover:border-indigo-500/30 transition-all group/item"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center  border border-white/5",
                                            d.type === 'hid' ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                                        )}>
                                            {d.type === 'hid' ? <Keyboard size={18} /> : <RadioReceiver size={18} />}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-foreground uppercase  leading-none">{d.name}</span>
                                            <p className="text-[9px] font-bold text-muted uppercase  mt-1.5 opacity-60">Signature: {d.type.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-muted uppercase  opacity-40">Healthy</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500  animate-pulse" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={requestHIDDevice}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase  transition-all flex justify-center items-center gap-3   active:scale-[0.98] group"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                        Pair HID Interface
                    </button>
                    <p className="text-[9px] font-bold text-muted/60 mt-4 text-center uppercase ">
                        MIDI units bridge automatically. Stream Decks require pairing.
                    </p>
                </div>

                {/* Logic Bridge Surface */}
                <div className="bg-card-bg/60 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-8 md:p-10  relative overflow-hidden flex flex-col group/bridge">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent animate-pulse" />

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 ">
                                <Zap size={24} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-foreground uppercase  leading-none mb-1.5">Logic Mappings</h2>
                                <span className="text-[9px] font-black text-muted uppercase  flex items-center gap-2">
                                    <Settings size={10} className="text-amber-500" />
                                    Macro Persistence
                                </span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                            <span className="text-[9px] font-black text-muted uppercase ">{mappings.length} Bound</span>
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
                                        <ArrowRight size={14} className="text-muted/40 group-hover/map-item:translate-x-1 transition-transform" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-black text-foreground uppercase  truncate max-w-[140px]">
                                                {mapping.rule?.name || 'Undefined Protocol'}
                                            </span>
                                            <p className="text-[8px] font-bold text-muted uppercase  mt-1">Primary Macro</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMapping(mapping.mapKey)}
                                        className="p-2.5 bg-white/5 border border-white/5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {mappings.length === 0 && (
                            <div className="p-12 border-2 border-dashed border-card-border/60 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 group-hover/bridge:opacity-60 transition-opacity">
                                <Zap size={40} className="text-muted mb-4 stroke-[1px]" />
                                <p className="text-[10px] font-black text-muted uppercase ">Matrix Unpopulated</p>
                                <p className="text-[9px] font-bold text-muted uppercase  mt-1">Bind physical input to logical macros</p>
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
                                <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] text-center  relative overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-30 animate-pulse pointer-events-none" />

                                    {!lastEvent ? (
                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center animate-bounce">
                                                <Keyboard size={24} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-foreground uppercase ">Passive Listening...</p>
                                                <p className="text-[9px] font-bold text-muted uppercase  mt-2 px-6">Press any physical button on your surface to capture the intercept key</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 relative z-10">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase  opacity-60">Intercept Identification:</p>
                                                <div className="inline-block px-5 py-3 bg-indigo-600 border border-indigo-500 text-white font-mono text-xs font-black rounded-xl   uppercase ">
                                                    {lastEvent.type} <span className="mx-2 opacity-50">::</span> {lastEvent.key}
                                                </div>
                                            </div>

                                            <div className="text-left mt-8 pt-8 border-t border-white/5">
                                                <p className="text-[10px] font-black uppercase  text-muted mb-4 px-2">Select Target Macro Protocol:</p>
                                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-3">
                                                    {manualMacros.length === 0 ? (
                                                        <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                                                            <p className="text-[10px] font-black text-muted uppercase ">No Manual Macros Primed</p>
                                                            <p className="text-[8px] font-bold text-muted/40 uppercase  mt-1">Create an automation with a manual trigger first</p>
                                                        </div>
                                                    ) : (
                                                        manualMacros.map(m => (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => handleAssign(m.id)}
                                                                className="w-full text-left px-5 py-4 bg-background/40 hover:bg-white/5 border border-card-border/60 hover:border-indigo-500/30 rounded-2xl transition-all group/macro "
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[11px] font-black text-foreground uppercase  group-hover/macro:text-indigo-400 transition-colors">{m.name}</span>
                                                                        <p className="text-[8px] font-bold text-muted uppercase  mt-1 italic">Authorized Logic ID: {m.id.slice(0, 6)}</p>
                                                                    </div>
                                                                    <Plus size={14} className="text-muted group-hover/macro:text-indigo-400 opacity-0 group-hover/macro:opacity-100 transition-all group-hover/macro:scale-125" />
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
                                    onClick={() => { setIsAssigning(false); clearLastEvent(); }}
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
