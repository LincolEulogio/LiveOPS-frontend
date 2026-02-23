'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rule } from '../types/automation.types';
import { X, Plus, Trash2, Zap, Play, ArrowRight, Settings2, Info, Clock, Bell, Monitor, Radio, CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/shared/socket/socket.provider';
import { intercomService } from '../../intercom/api/intercom.service';
import { productionsService } from '../../productions/api/productions.service';
import { motion, AnimatePresence } from 'framer-motion';

const ruleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    isEnabled: z.boolean().optional(),
    triggers: z.array(z.object({
        eventType: z.string().min(1, 'Event type is required'),
        condition: z.any().optional(),
    })).min(1, 'At least one trigger is required'),
    actions: z.array(z.object({
        actionType: z.string().min(1, 'Action type is required'),
        payload: z.any().optional(),
        order: z.number().optional(),
    })).min(1, 'At least one action is required'),
});

type FormValues = z.infer<typeof ruleSchema>;

interface Props {
    productionId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (dto: any) => Promise<void>;
    editingRule?: Rule;
}

const EVENT_TYPES = [
    { value: 'manual.trigger', label: 'Manual: Trigger as Macro', icon: Play, color: 'text-indigo-400 bg-indigo-500/10' },
    { value: 'timeline.block.started', label: 'Timeline: Block started', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { value: 'timeline.before_end', label: 'Time: Before block ends', icon: Clock, color: 'text-emerald-400 bg-emerald-500/10' },
    { value: 'timeline.updated', label: 'Timeline: Any update', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { value: 'obs.scene.changed', label: 'OBS: Scene Changed', icon: Monitor, color: 'text-blue-400 bg-blue-500/10' },
    { value: 'obs.stream.state', label: 'OBS: Stream State', icon: Radio, color: 'text-red-400 bg-red-500/10' },
    { value: 'vmix.input.changed', label: 'vMix: Input Changed', icon: Monitor, color: 'text-blue-400 bg-blue-500/10' },
];

const ACTION_TYPES = [
    { value: 'intercom.send', label: 'Alert: Send Intercom', icon: Bell, color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
    { value: 'obs.changeScene', label: 'OBS: Change Scene', icon: Monitor, color: 'text-blue-400 border-blue-500/50 bg-blue-500/10' },
    { value: 'vmix.cut', label: 'vMix: Cut', icon: Zap, color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
    { value: 'vmix.fade', label: 'vMix: Fade', icon: Zap, color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
    { value: 'webhook.call', label: 'HTTP: Call Webhook', icon: Zap, color: 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-500/10' },
];

export const RuleEditor = ({ productionId, isOpen, onClose, onSave, editingRule }: Props) => {
    const { socket } = useSocket();
    const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

    // Fetch dependencies
    const { data: templates = [] } = useQuery({
        queryKey: ['intercom-templates', productionId],
        queryFn: () => intercomService.getTemplates(productionId),
        enabled: isOpen,
    });

    const { data: production } = useQuery({
        queryKey: ['production', productionId],
        queryFn: () => productionsService.getProduction(productionId),
        enabled: isOpen,
    });

    const roles = useMemo(() => {
        if (!production?.users) return [];
        const uniqueRoles = new Map();
        production.users.forEach(u => {
            if (u.role) uniqueRoles.set(u.role.id, u.role.name);
        });
        return Array.from(uniqueRoles.entries()).map(([id, name]) => ({ id, name }));
    }, [production]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            name: '',
            description: '',
            isEnabled: true,
            triggers: [{ eventType: 'timeline.before_end', condition: { secondsBefore: 30 } }],
            actions: [{ actionType: 'intercom.send', order: 0, payload: { requiresAck: true } }],
        },
    });

    const { fields: triggerFields, append: appendTrigger, remove: removeTrigger } = useFieldArray({
        control,
        name: 'triggers',
    });

    const { fields: actionFields, append: appendAction, remove: removeAction, move: moveAction } = useFieldArray({
        control,
        name: 'actions',
    });

    const watchedTriggers = watch('triggers');
    const watchedActions = watch('actions');

    useEffect(() => {
        if (editingRule && isOpen) {
            reset({
                name: editingRule.name,
                description: editingRule.description || '',
                isEnabled: editingRule.isEnabled,
                triggers: editingRule.triggers.map(t => ({ eventType: t.eventType, condition: t.condition || {} })),
                actions: editingRule.actions.map(a => ({ actionType: a.actionType, payload: a.payload || {}, order: a.order })),
            });
        } else if (!editingRule && isOpen) {
            reset({
                name: '',
                description: '',
                isEnabled: true,
                triggers: [{ eventType: 'timeline.before_end', condition: { secondsBefore: 30 } }],
                actions: [{ actionType: 'intercom.send', order: 0, payload: { requiresAck: true } }],
            });
        }
    }, [editingRule, reset, isOpen]);

    const handleTest = async () => {
        const values = watch();
        if (!socket) return;
        socket.emit('rule.test', {
            productionId,
            rule: {
                ...values,
                id: editingRule?.id || 'new-rule-test',
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-7xl bg-stone-900 border border-stone-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-800 bg-stone-950">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                            <Zap size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {editingRule ? 'Edit Automation' : 'New Automation'}
                            </h2>
                            <div className="flex gap-2 items-center mt-1 text-xs font-bold text-stone-500 uppercase tracking-widest">
                                <span>Production</span>
                                <span className="w-1 h-1 rounded-full bg-stone-700" />
                                <span className="text-indigo-400">Rule Builder</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto bg-stone-950 custom-scrollbar flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-800">
                    {/* Visual Canvas (Left) */}
                    <div className="flex-1 p-8 bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:24px_24px] overflow-y-auto relative min-h-[500px] flex gap-12 flex-col items-center">

                        {/* Trigger Nodes */}
                        <div className="w-full max-w-sm space-y-4 relative z-10">
                            <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-center mb-6">Trigger Event</h3>

                            <AnimatePresence mode="popLayout">
                                {triggerFields.map((field, index) => {
                                    const eventType = watchedTriggers[index]?.eventType;
                                    const eTypeDef = EVENT_TYPES.find(e => e.value === eventType) || EVENT_TYPES[0];
                                    const Icon = eTypeDef.icon;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={field.id}
                                            className={cn(
                                                "group p-5 rounded-2xl border bg-stone-900 shadow-xl cursor-pointer transition-all",
                                                activeNodeIndex === -1 ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-stone-700 hover:border-stone-500"
                                            )}
                                            onClick={() => setActiveNodeIndex(-1)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-xl", eTypeDef.color)}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">When</p>
                                                        <p className="text-sm font-bold text-white leading-tight">{eTypeDef.label}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeTrigger(index); }} className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Action Pipeline */}
                        <div className="flex-1 w-full max-w-sm space-y-4 relative z-10">
                            <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] text-center mb-6">Action Sequence</h3>

                            <AnimatePresence mode="popLayout">
                                {actionFields.map((field, index) => {
                                    const actionType = watchedActions[index]?.actionType;
                                    const aTypeDef = ACTION_TYPES.find(a => a.value === actionType) || ACTION_TYPES[0];
                                    const Icon = aTypeDef.icon;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={field.id}
                                            className="relative"
                                        >
                                            {/* Connector Line */}
                                            <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-stone-700 -translate-x-1/2"></div>

                                            <div
                                                className={cn(
                                                    "group p-5 rounded-2xl border bg-stone-900 shadow-xl cursor-pointer transition-all",
                                                    activeNodeIndex === index ? `border-indigo-500 ring-2 ring-indigo-500/20` : `border-stone-700 hover:border-stone-500`
                                                )}
                                                onClick={() => setActiveNodeIndex(index)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-xl border flex items-center justify-center shrink-0", aTypeDef.color)}>
                                                            <span className="absolute -top-2 -left-2 w-5 h-5 bg-stone-800 border border-stone-700 rounded-full flex items-center justify-center text-[9px] font-black text-white">{index + 1}</span>
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Then do</p>
                                                            <p className="text-sm font-bold text-white leading-tight">{aTypeDef.label}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeAction(index); if (activeNodeIndex === index) setActiveNodeIndex(null); }} className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            {/* Add Action Node */}
                            <motion.div layout className="relative pt-6">
                                <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-stone-800 -translate-x-1/2"></div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        appendAction({ actionType: 'obs.changeScene', order: actionFields.length, payload: {} });
                                        setActiveNodeIndex(actionFields.length); // auto select new node
                                    }}
                                    className="w-full border-2 border-dashed border-stone-800 hover:border-indigo-500/50 bg-stone-900/30 hover:bg-stone-900/80 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-stone-800 group-hover:bg-indigo-500/20 text-stone-500 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                                        <Plus size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-stone-500 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">Add Action</span>
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Configuration Panel (Right) */}
                    <div className="w-full md:w-[400px] shrink-0 bg-stone-900 flex flex-col relative z-20">
                        {/* Global Settings */}
                        <div className="p-6 border-b border-stone-800 bg-stone-950/50">
                            <h3 className="text-xs font-black text-stone-500 uppercase tracking-[0.2em] mb-4">Rule Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        {...register('name')}
                                        placeholder="Rule Name"
                                        className="w-full bg-transparent text-xl font-bold text-white placeholder:text-stone-700 outline-none pb-1 border-b border-stone-800 focus:border-indigo-500 transition-colors"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 tracking-widest">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <input
                                        {...register('description')}
                                        placeholder="Optional description..."
                                        className="w-full bg-transparent text-sm text-stone-400 placeholder:text-stone-700 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Node Inspector */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-stone-900">
                            <AnimatePresence mode="wait">
                                {activeNodeIndex === null ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                        <Settings2 size={48} className="text-stone-700 mb-4" />
                                        <p className="text-sm text-stone-500 font-bold">Select a node to configure</p>
                                    </motion.div>
                                ) : activeNodeIndex === -1 ? (
                                    // TRIGGER CONFIG
                                    <motion.div key="trigger-config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                                            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Zap size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Configuring</p>
                                                <h4 className="font-bold text-white">Trigger Node</h4>
                                            </div>
                                        </div>

                                        {triggerFields.map((field, index) => (
                                            <div key={field.id} className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Event Type</label>
                                                    <select
                                                        {...register(`triggers.${index}.eventType`)}
                                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    >
                                                        {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                                    </select>
                                                </div>

                                                {watchedTriggers[index]?.eventType === 'timeline.before_end' && (
                                                    <div className="space-y-2 p-4 bg-stone-800/20 rounded-xl border border-stone-800">
                                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pre-roll Time (Seconds)</label>
                                                        <input
                                                            type="number"
                                                            {...register(`triggers.${index}.condition.secondsBefore`, { valueAsNumber: true })}
                                                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {watchedTriggers[index]?.eventType === 'obs.scene.changed' && (
                                                    <div className="space-y-2 p-4 bg-stone-800/20 rounded-xl border border-stone-800">
                                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Target Scene Name (Optional)</label>
                                                        <input
                                                            placeholder="Leave blank for any scene..."
                                                            {...register(`triggers.${index}.condition.sceneName`)}
                                                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    // ACTION CONFIG
                                    <motion.div key={`action-config-${activeNodeIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><Play size={20} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Configuring Action</p>
                                                <h4 className="font-bold text-white">Step {activeNodeIndex + 1}</h4>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Action Type</label>
                                                <select
                                                    {...register(`actions.${activeNodeIndex}.actionType`)}
                                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                >
                                                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                                </select>
                                            </div>

                                            {watchedActions[activeNodeIndex]?.actionType === 'intercom.send' && (
                                                <div className="space-y-4 p-4 bg-stone-800/20 rounded-xl border border-stone-800">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Alert Template</label>
                                                        <select
                                                            {...register(`actions.${activeNodeIndex}.payload.templateId`)}
                                                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        >
                                                            <option value="">Custom Message Only</option>
                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Target Role</label>
                                                        <select
                                                            {...register(`actions.${activeNodeIndex}.payload.targetRoleId`)}
                                                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        >
                                                            <option value="">Broadcast (All)</option>
                                                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Message Override</label>
                                                        <input
                                                            placeholder="Dynamic alert text..."
                                                            {...register(`actions.${activeNodeIndex}.payload.message`)}
                                                            className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {watchedActions[activeNodeIndex]?.actionType === 'obs.changeScene' && (
                                                <div className="space-y-2 p-4 bg-stone-800/20 rounded-xl border border-stone-800">
                                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Target Scene Name</label>
                                                    <input
                                                        placeholder="Exact scene name..."
                                                        {...register(`actions.${activeNodeIndex}.payload.sceneName`)}
                                                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                            )}

                                            {watchedActions[activeNodeIndex]?.actionType === 'vmix.changeInput' && (
                                                <div className="space-y-2 p-4 bg-stone-800/20 rounded-xl border border-stone-800">
                                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Input Name / Number</label>
                                                    <input
                                                        placeholder="e.g. 1"
                                                        {...register(`actions.${activeNodeIndex}.payload.input`)}
                                                        className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleTest}
                            className="p-3 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all"
                            title="Test Automation"
                        >
                            <Zap size={20} />
                        </button>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest hidden md:block">
                            {actionFields.length} actions configured
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 shrink-0 text-xs font-bold text-stone-400 hover:text-white transition-all uppercase tracking-widest rounded-xl hover:bg-stone-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSave)}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl transition-all shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Save Rule'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
