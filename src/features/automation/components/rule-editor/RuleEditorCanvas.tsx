import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowDown, Plus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface RuleEditorCanvasProps {
    triggerFields: any[];
    actionFields: any[];
    watchedTriggers: any[];
    watchedActions: any[];
    activeNodeIndex: number | null;
    setActiveNodeIndex: (index: number | null) => void;
    removeTrigger: (index: number) => void;
    removeAction: (index: number) => void;
    appendAction: (action: any) => void;
    EVENT_TYPES: any[];
    ACTION_TYPES: any[];
}

export const RuleEditorCanvas: React.FC<RuleEditorCanvasProps> = ({
    triggerFields,
    actionFields,
    watchedTriggers,
    watchedActions,
    activeNodeIndex,
    setActiveNodeIndex,
    removeTrigger,
    removeAction,
    appendAction,
    EVENT_TYPES,
    ACTION_TYPES
}) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] relative flex flex-col items-center min-h-[400px]">
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-white/5 border border-white/5 rounded-full">
                    <span className="text-[8px] font-black text-muted uppercase ">Signal Flow Visualization</span>
                </div>
            </div>

            {/* Trigger Section */}
            <div className="w-full max-w-sm space-y-6 relative mt-10">
                <AnimatePresence mode="popLayout">
                    {triggerFields.map((field, index) => {
                        const eventType = watchedTriggers[index]?.eventType;
                        const eTypeDef = EVENT_TYPES.find(e => e.value === eventType) || EVENT_TYPES[0];
                        const Icon = eTypeDef.icon;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={field.id}
                                className={cn(
                                    "group relative p-6 rounded-3xl border transition-all cursor-pointer ",
                                    activeNodeIndex === -1
                                        ? "bg-indigo-600/10 border-indigo-500  scale-105 z-20"
                                        : "bg-card-bg/60 backdrop-blur-md border-card-border/60 hover:border-indigo-500/50"
                                )}
                                onClick={() => setActiveNodeIndex(-1)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center  border", eTypeDef.color.replace('text-', 'border-').replace('bg-', 'bg-').split(' ')[0], "border-white/10")}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted uppercase  mb-1">Entrance Point</p>
                                            <p className="text-md font-black text-foreground uppercase ">{eTypeDef.label}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeTrigger(index); }} className="p-2 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-75">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Connecting Line Vector */}
            <div className="flex flex-col items-center my-6 gap-2">
                <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500/50 to-indigo-500" />
                <div className="p-2 bg-indigo-500 rounded-full ">
                    <ArrowDown size={14} className="text-white" />
                </div>
                <div className="w-0.5 h-12 bg-gradient-to-b from-indigo-500 to-indigo-500/50" />
            </div>

            {/* Actions Pipeline */}
            <div className="w-full max-w-sm space-y-6 relative">
                <AnimatePresence mode="popLayout">
                    {actionFields.map((field, index) => {
                        const actionType = watchedActions[index]?.actionType;
                        const aTypeDef = ACTION_TYPES.find(a => a.value === actionType) || ACTION_TYPES[0];
                        const Icon = aTypeDef.icon;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={field.id}
                                className="relative"
                            >
                                <div
                                    className={cn(
                                        "group p-6 rounded-3xl border transition-all cursor-pointer ",
                                        activeNodeIndex === index
                                            ? "bg-indigo-600/10 border-indigo-500  scale-105 z-20"
                                            : "bg-card-bg/60 backdrop-blur-md border-card-border/60 hover:border-indigo-500/50"
                                    )}
                                    onClick={() => setActiveNodeIndex(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 relative", aTypeDef.color)}>
                                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-card-bg border-4 border-background rounded-full flex items-center justify-center text-xs font-black text-indigo-400 ">
                                                    {index + 1}
                                                </div>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-muted uppercase  mb-1 text-emerald-400">Execution Block</p>
                                                <p className="text-md font-black text-foreground uppercase ">{aTypeDef.label}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeAction(index); if (activeNodeIndex === index) setActiveNodeIndex(null); }} className="p-2 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-75">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {index < actionFields.length - 1 && (
                                    <div className="flex flex-col items-center py-2">
                                        <div className="w-1 h-3 bg-indigo-500/20 rounded-full" />
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                <motion.button
                    layout
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        appendAction({ actionType: 'obs.changeScene', order: actionFields.length, payload: {} });
                        setActiveNodeIndex(actionFields.length);
                    }}
                    className="w-full border-2 border-dashed border-card-border/60 hover:border-indigo-500/60 bg-white/5 hover:bg-white/10 p-6 rounded-3xl flex items-center justify-center gap-4 transition-all group mt-6 "
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Plus size={20} />
                    </div>
                    <span className="text-[11px] font-black text-muted group-hover:text-indigo-400 transition-colors uppercase ">Append Instruction</span>
                </motion.button>
            </div>
        </div>
    );
};
