import React from 'react';
import { Activity, Settings2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RuleEditorInspectorProps {
    register: any;
    errors: any;
    watchedTriggers: any[];
    watchedActions: any[];
    activeNodeIndex: number | null;
    EVENT_TYPES: any[];
    ACTION_TYPES: any[];
    triggerFields: any[];
    templates: any[];
    roles: any[];
}

export const RuleEditorInspector: React.FC<RuleEditorInspectorProps> = ({
    register,
    errors,
    watchedTriggers,
    watchedActions,
    activeNodeIndex,
    EVENT_TYPES,
    ACTION_TYPES,
    triggerFields,
    templates,
    roles
}) => {
    return (
        <div className="w-full lg:w-[450px] shrink-0 bg-black/20 backdrop-blur-md flex flex-col p-6 lg:p-10 gap-8 overflow-y-auto custom-scrollbar">
            {/* Identify Block */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Activity size={16} className="text-indigo-400" />
                    <h3 className="text-xs font-black text-foreground/50 uppercase ">Initial Identity</h3>
                </div>
                <div className="space-y-5 bg-white/5 p-6 rounded-3xl border border-white/5 ">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase  pl-1">Rule Designation</label>
                        <input
                            {...register('name')}
                            placeholder="Identification handle..."
                            className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase  "
                        />
                        {errors.name && <p className="text-[9px] text-red-400 font-black uppercase mt-1  px-1">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase  pl-1">Protocol Description</label>
                        <textarea
                            {...register('description')}
                            rows={2}
                            placeholder="Instructional context..."
                            className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none "
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Node Inspector */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <Settings2 size={16} className="text-amber-400" />
                    <h3 className="text-xs font-black text-foreground/50 uppercase ">Module Parameters</h3>
                </div>

                <AnimatePresence mode="wait">
                    {activeNodeIndex === null ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-40">
                            <Info size={40} className="text-muted mb-4 stroke-[1px]" />
                            <p className="text-[10px] font-black text-muted uppercase  leading-relaxed">Awaiting node selection<br />for detailed configuration</p>
                        </motion.div>
                    ) : activeNodeIndex === -1 ? (
                        <motion.div key="trigger-config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {triggerFields.map((field, index) => (
                                <div key={field.id} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted uppercase  px-1">Trigger Signal Source</label>
                                        <select
                                            {...register(`triggers.${index}.eventType`)}
                                            className="w-full bg-background border border-card-border rounded-xl px-5 py-4 text-xs font-black text-foreground uppercase  outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                        >
                                            {EVENT_TYPES.map(e => <option key={e.value} value={e.value} className="bg-card-bg">{e.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="p-6 bg-indigo-600/5 border border-white/5 rounded-3xl  space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity size={14} className="text-indigo-400" />
                                            <span className="text-[10px] font-black text-muted uppercase ">Operational Logic</span>
                                        </div>

                                        {watchedTriggers[index]?.eventType === 'timeline.before_end' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted uppercase  pl-1">Threshold Offset (Seconds)</label>
                                                <input
                                                    type="number"
                                                    {...register(`triggers.${index}.condition.secondsBefore`, { valueAsNumber: true })}
                                                    className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none "
                                                />
                                            </div>
                                        )}

                                        {watchedTriggers[index]?.eventType === 'obs.scene.changed' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted uppercase  pl-1">Target Scene Identification</label>
                                                <input
                                                    placeholder="Leave blank for universal listen..."
                                                    {...register(`triggers.${index}.condition.sceneName`)}
                                                    className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 "
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key={`action-config-${activeNodeIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted uppercase  px-1">Instruction Type</label>
                                <select
                                    {...register(`actions.${activeNodeIndex}.actionType`)}
                                    className="w-full bg-background border border-card-border rounded-xl px-5 py-4 text-xs font-black text-foreground uppercase  outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value} className="bg-card-bg">{a.label}</option>)}
                                </select>
                            </div>

                            <div className="p-6 bg-emerald-600/5 border border-white/5 rounded-3xl  space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-muted uppercase ">Payload Configuration</span>
                                </div>

                                {watchedActions[activeNodeIndex]?.actionType === 'intercom.send' && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase  pl-1">Transmission Template</label>
                                            <select
                                                {...register(`actions.${activeNodeIndex}.payload.templateId`)}
                                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500  appearance-none"
                                            >
                                                <option value="">MANUAL OVERRIDE ONLY</option>
                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase  pl-1">Downlink Recipient</label>
                                            <select
                                                {...register(`actions.${activeNodeIndex}.payload.targetRoleId`)}
                                                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500  appearance-none"
                                            >
                                                <option value="">GLOBAL BROADCAST</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted uppercase  pl-1">Custom Message Stream</label>
                                            <input
                                                placeholder="Inject dynamic alert sequence..."
                                                {...register(`actions.${activeNodeIndex}.payload.message`)}
                                                className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none  transition-all focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {watchedActions[activeNodeIndex]?.actionType === 'obs.changeScene' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted uppercase  pl-1">Destination Scene Identity</label>
                                        <input
                                            placeholder="Exact scene nomenclature..."
                                            {...register(`actions.${activeNodeIndex}.payload.sceneName`)}
                                            className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none "
                                        />
                                    </div>
                                )}

                                {watchedActions[activeNodeIndex]?.actionType === 'vmix.changeInput' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted uppercase  pl-1">Signal Port / Identification</label>
                                        <input
                                            placeholder="Port Address / Name..."
                                            {...register(`actions.${activeNodeIndex}.payload.input`)}
                                            className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none "
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
