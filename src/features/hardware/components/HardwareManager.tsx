'use client';

import { useHardware } from '../hooks/useHardware';
import { useAutomation } from '@/features/automation/hooks/useAutomation';
import { useState, useEffect } from 'react';
import { Settings, Plus, X, Keyboard, RadioReceiver, Zap } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

// Local storage key for mappings
const getMappingsKey = (prodId: string) => `liveops_hw_mappings_${prodId}`;

export const HardwareManager = ({ productionId }: Props) => {
    const { devices, lastEvent, error, requestHIDDevice, clearLastEvent } = useHardware();
    const { rules, triggerRule } = useAutomation(productionId);

    // Mappings: { "hid:Btn 1": "rule_id" }
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [isAssigning, setIsAssigning] = useState(false);

    // Load mappings
    useEffect(() => {
        const saved = localStorage.getItem(getMappingsKey(productionId));
        if (saved) {
            try {
                setMappings(JSON.parse(saved));
            } catch (e) { }
        }
    }, [productionId]);

    // Save mappings
    const saveMappings = (newMappings: Record<string, string>) => {
        setMappings(newMappings);
        localStorage.setItem(getMappingsKey(productionId), JSON.stringify(newMappings));
    };

    // Listen for mapped key presses to trigger rules
    useEffect(() => {
        if (lastEvent && lastEvent.state === 'pressed' && !isAssigning) {
            const mapKey = `${lastEvent.type}:${lastEvent.key}`;
            const ruleId = mappings[mapKey];
            if (ruleId) {
                const rule = rules.find(r => r.id === ruleId);
                if (rule) {
                    console.log(`Triggering macro ${rule.name} via hardware ${mapKey}`);
                    triggerRule(rule);
                    // Provide a small visual feedback if needed, but the rule will execute
                }
            }
        }
    }, [lastEvent, isAssigning, mappings, rules, triggerRule]);

    const handleAssign = (ruleId: string) => {
        if (!lastEvent) return;
        const mapKey = `${lastEvent.type}:${lastEvent.key}`;
        saveMappings({ ...mappings, [mapKey]: ruleId });
        setIsAssigning(false);
        clearLastEvent();
    };

    const removeMapping = (mapKey: string) => {
        const newMap = { ...mappings };
        delete newMap[mapKey];
        saveMappings(newMap);
    };

    const manualMacros = rules.filter(r => r.isEnabled && r.triggers.some(t => t.eventType === 'manual.trigger'));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Device List */}
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Keyboard size={18} className="text-indigo-400" />
                        Connected Devices
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        {devices.length === 0 ? (
                            <div className="text-xs text-stone-500 text-center py-6 border border-stone-800 border-dashed rounded-xl">
                                No MIDI or HID devices detected automatically.
                            </div>
                        ) : (
                            devices.map(d => (
                                <div key={d.id} className="flex justify-between items-center p-3 bg-stone-800/50 rounded-xl border border-stone-700/50">
                                    <div className="flex items-center gap-3">
                                        {d.type === 'hid' ? <Keyboard size={16} className="text-indigo-400" /> : <RadioReceiver size={16} className="text-emerald-400" />}
                                        <span className="text-sm font-bold text-stone-200">{d.name}</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={requestHIDDevice}
                        className="w-full py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-bold text-stone-300 transition-all flex justify-center items-center gap-2"
                    >
                        <Plus size={14} /> Connect Stream Deck / HID Device
                    </button>
                    <p className="text-[10px] text-stone-500 mt-3 text-center">
                        MIDI devices are detected automatically. HID devices require manual permission.
                    </p>
                </div>

                {/* Key Mapper */}
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Zap size={18} className="text-amber-400" />
                        Hardware Mapping
                    </h2>

                    <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                        {/* Display current Mappings */}
                        {Object.entries(mappings).map(([mapKey, ruleId]) => {
                            const matchedRule = rules.find(r => r.id === ruleId);
                            return (
                                <div key={mapKey} className="flex justify-between items-center p-3 bg-stone-950 rounded-xl border border-stone-800">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-stone-800 rounded-md text-[10px] font-mono text-indigo-300 whitespace-nowrap">
                                            {mapKey}
                                        </div>
                                        <ArrowRight size={14} className="text-stone-600" />
                                        <span className="text-sm font-bold text-stone-300 truncate max-w-[150px]">
                                            {matchedRule ? matchedRule.name : 'Unknown Rule'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeMapping(mapKey)}
                                        className="text-stone-600 hover:text-red-400 p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })}
                        {Object.keys(mappings).length === 0 && (
                            <div className="text-xs text-stone-500 text-center py-6">
                                No hardware mapped yet.
                            </div>
                        )}
                    </div>

                    {/* Mapping Listener Mode */}
                    <div className="mt-6 pt-6 border-t border-stone-800">
                        {!isAssigning ? (
                            <button
                                onClick={() => setIsAssigning(true)}
                                className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 rounded-xl text-xs font-bold text-indigo-400 transition-all"
                            >
                                Add New Mapping
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                                    {!lastEvent ? (
                                        <p className="text-xs font-bold text-indigo-300 animate-pulse">
                                            Press any physical button on your connected hardware...
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-xs text-stone-400">Detected input:</p>
                                            <div className="inline-block px-3 py-1 bg-indigo-600 text-white font-mono text-sm font-bold rounded-lg shadow-lg">
                                                {lastEvent.type.toUpperCase()} : {lastEvent.key}
                                            </div>

                                            <div className="text-left mt-4 pt-4 border-t border-indigo-500/20">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Assign to Macro:</p>
                                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                                    {manualMacros.length === 0 ? (
                                                        <p className="text-xs text-stone-500">No manual macros available. Create one first.</p>
                                                    ) : (
                                                        manualMacros.map(m => (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => handleAssign(m.id)}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-all"
                                                            >
                                                                {m.name}
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
                                    className="w-full py-2 bg-transparent hover:bg-stone-800 rounded-xl text-xs font-bold text-stone-500 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const ArrowRight = ({ size, className }: { size: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);
