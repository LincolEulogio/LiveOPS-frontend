'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rule } from '../types/automation.types';
import { X, Plus, Trash2, Zap, Play, ArrowRight, Settings2, Info, Clock, Bell, Monitor, Radio, CheckCircle2, AlertTriangle, ArrowDown, Activity, Save } from 'lucide-react';
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

    const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full h-full md:h-auto md:max-h-[95vh] max-w-[1400px] bg-card-bg/60 backdrop-blur-2xl border border-card-border md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
            >
                {/* Visual Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-10 border-b border-card-border/50 bg-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                            <Zap size={32} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight leading-none mb-2">
                                {editingRule ? 'Modify Interaction' : 'Initialize Logic'}
                            </h2>
                            <div className="flex flex-wrap gap-2 items-center text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                                <span className="opacity-60 text-indigo-400">Dynamic Gateway</span>
                                <ArrowRight size={10} />
                                <span>Rule Configurator</span>
                                <ArrowRight size={10} />
                                <span className="p-1 px-2 bg-white/5 rounded-md border border-white/5">{productionId.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                    >
                        <X size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-card-border/50 bg-background/20 relative z-10">

                    {/* Visual Logic Canvas (Scrollable Center) */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8 lg:p-12 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] relative flex flex-col items-center min-h-[400px]">

                        <div className="absolute top-6 left-1/2 -translate-x-1/2">
                            <div className="px-4 py-1 bg-white/5 border border-white/5 rounded-full">
                                <span className="text-[8px] font-black text-muted uppercase tracking-[0.3em]">Signal Flow Visualization</span>
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
                                                "group relative p-6 rounded-3xl border transition-all cursor-pointer shadow-xl",
                                                activeNodeIndex === -1
                                                    ? "bg-indigo-600/10 border-indigo-500 shadow-indigo-600/10 scale-105 z-20"
                                                    : "bg-card-bg/60 backdrop-blur-md border-card-border/60 hover:border-indigo-500/50"
                                            )}
                                            onClick={() => setActiveNodeIndex(-1)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border", eTypeDef.color.replace('text-', 'border-').replace('bg-', 'bg-').split(' ')[0], "border-white/10")}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Entrance Point</p>
                                                        <p className="text-md font-black text-foreground uppercase tracking-tight">{eTypeDef.label}</p>
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
                            <div className="p-2 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]">
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
                                                    "group p-6 rounded-3xl border transition-all cursor-pointer shadow-xl",
                                                    activeNodeIndex === index
                                                        ? "bg-indigo-600/10 border-indigo-500 shadow-indigo-600/10 scale-105 z-20"
                                                        : "bg-card-bg/60 backdrop-blur-md border-card-border/60 hover:border-indigo-500/50"
                                                )}
                                                onClick={() => setActiveNodeIndex(index)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 relative", aTypeDef.color)}>
                                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-card-bg border-4 border-background rounded-full flex items-center justify-center text-xs font-black text-indigo-400 shadow-lg">
                                                                {index + 1}
                                                            </div>
                                                            <Icon size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 text-emerald-400">Execution Block</p>
                                                            <p className="text-md font-black text-foreground uppercase tracking-tight">{aTypeDef.label}</p>
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
                                className="w-full border-2 border-dashed border-card-border/60 hover:border-indigo-500/60 bg-white/5 hover:bg-white/10 p-6 rounded-3xl flex items-center justify-center gap-4 transition-all group mt-6 shadow-inner"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Plus size={20} />
                                </div>
                                <span className="text-[11px] font-black text-muted group-hover:text-indigo-400 transition-colors uppercase tracking-[0.3em]">Append Instruction</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Instruction Configurator (Right Sidebar) */}
                    <div className="w-full lg:w-[450px] shrink-0 bg-black/20 backdrop-blur-md flex flex-col p-6 lg:p-10 gap-8 overflow-y-auto custom-scrollbar">

                        {/* Identify Block */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-indigo-400" />
                                <h3 className="text-xs font-black text-muted uppercase tracking-[0.3em]">Initial Identity</h3>
                            </div>
                            <div className="space-y-5 bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Rule Designation</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Identification handle..."
                                        className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase tracking-tight shadow-inner"
                                    />
                                    {errors.name && <p className="text-[9px] text-red-400 font-black uppercase mt-1 tracking-widest px-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Protocol Description</label>
                                    <textarea
                                        {...register('description')}
                                        rows={2}
                                        placeholder="Instructional context..."
                                        className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Node Inspector */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <Settings2 size={16} className="text-amber-400" />
                                <h3 className="text-xs font-black text-muted uppercase tracking-[0.3em]">Module Parameters</h3>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeNodeIndex === null ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-40">
                                        <Info size={40} className="text-muted mb-4 stroke-[1px]" />
                                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] leading-relaxed">Awaiting node selection<br />for detailed configuration</p>
                                    </motion.div>
                                ) : activeNodeIndex === -1 ? (
                                    <motion.div key="trigger-config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {triggerFields.map((field, index) => (
                                            <div key={field.id} className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Trigger Signal Source</label>
                                                    <select
                                                        {...register(`triggers.${index}.eventType`)}
                                                        className="w-full bg-background border border-card-border rounded-xl px-5 py-4 text-xs font-black text-foreground uppercase tracking-wider outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                                    >
                                                        {EVENT_TYPES.map(e => <option key={e.value} value={e.value} className="bg-card-bg">{e.label}</option>)}
                                                    </select>
                                                </div>

                                                <div className="p-6 bg-indigo-600/5 border border-white/5 rounded-3xl shadow-inner space-y-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Activity size={14} className="text-indigo-400" />
                                                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Operational Logic</span>
                                                    </div>

                                                    {watchedTriggers[index]?.eventType === 'timeline.before_end' && (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Threshold Offset (Seconds)</label>
                                                            <input
                                                                type="number"
                                                                {...register(`triggers.${index}.condition.secondsBefore`, { valueAsNumber: true })}
                                                                className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-inner"
                                                            />
                                                        </div>
                                                    )}

                                                    {watchedTriggers[index]?.eventType === 'obs.scene.changed' && (
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Target Scene Identification</label>
                                                            <input
                                                                placeholder="Leave blank for universal listen..."
                                                                {...register(`triggers.${index}.condition.sceneName`)}
                                                                className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
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
                                            <label className="text-[10px] font-black text-muted uppercase tracking-widest px-1">Instruction Type</label>
                                            <select
                                                {...register(`actions.${activeNodeIndex}.actionType`)}
                                                className="w-full bg-background border border-card-border rounded-xl px-5 py-4 text-xs font-black text-foreground uppercase tracking-wider outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                                            >
                                                {ACTION_TYPES.map(a => <option key={a.value} value={a.value} className="bg-card-bg">{a.label}</option>)}
                                            </select>
                                        </div>

                                        <div className="p-6 bg-emerald-600/5 border border-white/5 rounded-3xl shadow-inner space-y-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-emerald-400" />
                                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Payload Configuration</span>
                                            </div>

                                            {watchedActions[activeNodeIndex]?.actionType === 'intercom.send' && (
                                                <div className="space-y-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Transmission Template</label>
                                                        <select
                                                            {...register(`actions.${activeNodeIndex}.payload.templateId`)}
                                                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner appearance-none"
                                                        >
                                                            <option value="">MANUAL OVERRIDE ONLY</option>
                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Downlink Recipient</label>
                                                        <select
                                                            {...register(`actions.${activeNodeIndex}.payload.targetRoleId`)}
                                                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-[11px] font-bold text-foreground outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner appearance-none"
                                                        >
                                                            <option value="">GLOBAL BROADCAST</option>
                                                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Custom Message Stream</label>
                                                        <input
                                                            placeholder="Inject dynamic alert sequence..."
                                                            {...register(`actions.${activeNodeIndex}.payload.message`)}
                                                            className="w-full bg-background/50 border border-card-border rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none shadow-inner transition-all focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {watchedActions[activeNodeIndex]?.actionType === 'obs.changeScene' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Destination Scene Identity</label>
                                                    <input
                                                        placeholder="Exact scene nomenclature..."
                                                        {...register(`actions.${activeNodeIndex}.payload.sceneName`)}
                                                        className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none shadow-inner"
                                                    />
                                                </div>
                                            )}

                                            {watchedActions[activeNodeIndex]?.actionType === 'vmix.changeInput' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Signal Port / Identification</label>
                                                    <input
                                                        placeholder="Port Address / Name..."
                                                        {...register(`actions.${activeNodeIndex}.payload.input`)}
                                                        className="w-full bg-background/50 border border-card-border rounded-xl px-5 py-4 text-sm font-black text-foreground outline-none shadow-inner"
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

                {/* Footer Controls */}
                <div className="p-6 md:p-10 border-t border-card-border/50 bg-background/40 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleTest}
                            className="w-14 h-14 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-amber-500/10 active:scale-90 group"
                            title="Dry Run Protocol"
                        >
                            <Play size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Instruction Set</p>
                            <p className="text-xs font-black text-foreground uppercase tracking-tight">{actionFields.length} Logical Nodes Primed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-5 text-[10px] font-black text-muted hover:text-foreground transition-all uppercase tracking-[0.2em] rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95"
                        >
                            Abort
                        </button>
                        <button
                            onClick={handleSubmit(onSave)}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-600/30 uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 overflow-hidden group"
                        >
                            {isSubmitting ? (
                                <Activity size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    {editingRule ? 'Commit Changes' : 'Initialize Protocol'}
                                </>
                            )}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
