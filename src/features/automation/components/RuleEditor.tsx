'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rule, CreateRuleDto } from '../types/automation.types';
import { X, Plus, Trash2, Zap, Play, ArrowRight, Settings2, Info, Clock, Bell, Monitor, Radio } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/shared/socket/socket.provider';
import { intercomService } from '../../intercom/api/intercom.service';
import { productionsService } from '../../productions/api/productions.service';

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
    { value: 'manual.trigger', label: 'Manual: Trigger as Macro', icon: Play },
    { value: 'timeline.block.started', label: 'Timeline: Block started', icon: Zap },
    { value: 'timeline.before_end', label: 'Time: Before block ends', icon: Clock },
    { value: 'timeline.updated', label: 'Timeline: Any update', icon: Zap },
    { value: 'obs.scene.changed', label: 'OBS: Scene Changed', icon: Monitor },
    { value: 'obs.stream.state', label: 'OBS: Stream State', icon: Radio },
    { value: 'vmix.input.changed', label: 'vMix: Input Changed', icon: Monitor },
];

const ACTION_TYPES = [
    { value: 'intercom.send', label: 'Alert: Send Intercom Command', icon: Bell },
    { value: 'obs.changeScene', label: 'OBS: Change Scene', icon: Monitor },
    { value: 'vmix.cut', label: 'vMix: Cut', icon: Zap },
    { value: 'vmix.fade', label: 'vMix: Fade', icon: Zap },
    { value: 'webhook.call', label: 'HTTP: Call Webhook', icon: Zap },
];

export const RuleEditor = ({ productionId, isOpen, onClose, onSave, editingRule }: Props) => {
    const { socket } = useSocket();
    // Fetch dependencies for selects
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
        setValue,
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

        // Emit a temporary event to trigger this specific rule's actions
        // In a real system, we'd have a backend endpoint for this, 
        // but for now we'll simulate the triggers.
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-800 bg-stone-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {editingRule ? 'Edit Rule' : 'New Automation Rule'}
                            </h2>
                            <p className="text-xs text-stone-500">Configure triggers and sequential actions.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white p-2 hover:bg-stone-800 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Rule Name</label>
                            <input
                                {...register('name')}
                                placeholder="e.g., Warning: Block Ending"
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder:text-stone-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                            {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Description</label>
                            <input
                                {...register('description')}
                                placeholder="Action triggered automatically..."
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder:text-stone-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-stone-800/50"></div>

                    {/* Triggers */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-amber-400" />
                                When this happens...
                            </h3>
                            <button
                                type="button"
                                onClick={() => appendTrigger({ eventType: 'timeline.updated', condition: {} })}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Trigger
                            </button>
                        </div>

                        <div className="space-y-4">
                            {triggerFields.map((field, index) => (
                                <div key={field.id} className="bg-stone-950/40 p-5 rounded-2xl border border-stone-800/50 group space-y-4">
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Event Trigger</label>
                                            <select
                                                {...register(`triggers.${index}.eventType`)}
                                                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            >
                                                {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                            </select>
                                        </div>
                                        {triggerFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTrigger(index)}
                                                className="p-2.5 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl mb-0.5 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Trigger Conditions */}
                                    {watchedTriggers[index]?.eventType === 'timeline.before_end' && (
                                        <div className="pt-2 pl-4 border-l-2 border-stone-800 space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500">Seconds before end</label>
                                                <input
                                                    type="number"
                                                    {...register(`triggers.${index}.condition.secondsBefore`, { valueAsNumber: true })}
                                                    className="w-24 bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {watchedTriggers[index]?.eventType === 'obs.scene.changed' && (
                                        <div className="pt-2 pl-4 border-l-2 border-stone-800 space-y-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500">Only for scene name (Optional)</label>
                                                <input
                                                    placeholder="Input name..."
                                                    {...register(`triggers.${index}.condition.sceneName`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center py-2">
                        <ArrowRight size={20} className="text-stone-800 rotate-90" />
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Play size={14} className="text-indigo-400" />
                                Do these actions...
                            </h3>
                            <button
                                type="button"
                                onClick={() => appendAction({ actionType: 'obs.changeScene', order: actionFields.length, payload: {} })}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Action
                            </button>
                        </div>

                        <div className="space-y-4">
                            {actionFields.map((field, index) => (
                                <div key={field.id} className="relative bg-stone-950/40 p-5 rounded-2xl border border-stone-800/50 group space-y-4 animate-in slide-in-from-left-2 duration-300">
                                    <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-500 ring-4 ring-stone-900">
                                        {index + 1}
                                    </div>

                                    <div className="flex gap-4 items-end ml-2">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Action Type</label>
                                            <select
                                                {...register(`actions.${index}.actionType`)}
                                                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            >
                                                {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                            </select>
                                        </div>
                                        {actionFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAction(index)}
                                                className="p-2.5 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl mb-0.5 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Payloads */}
                                    {watchedActions[index]?.actionType === 'intercom.send' && (
                                        <div className="pt-2 ml-2 pl-4 border-l-2 border-indigo-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Alert Template</label>
                                                <select
                                                    {...register(`actions.${index}.payload.templateId`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                >
                                                    <option value="">Custom Message Only</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Target Role</label>
                                                <select
                                                    {...register(`actions.${index}.payload.targetRoleId`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                >
                                                    <option value="">Broadcast (All)</option>
                                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Optional Message Override</label>
                                                <input
                                                    placeholder="Keep empty to use template name..."
                                                    {...register(`actions.${index}.payload.message`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {watchedActions[index]?.actionType === 'obs.changeScene' && (
                                        <div className="pt-2 ml-2 pl-4 border-l-2 border-indigo-500/30">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Target Scene Name</label>
                                                <input
                                                    placeholder="Exact scene name in OBS..."
                                                    {...register(`actions.${index}.payload.sceneName`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {watchedActions[index]?.actionType === 'vmix.changeInput' && (
                                        <div className="pt-2 ml-2 pl-4 border-l-2 border-indigo-500/30">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Input Number or Name</label>
                                                <input
                                                    placeholder="Input in vMix..."
                                                    {...register(`actions.${index}.payload.input`)}
                                                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-stone-800 bg-stone-900/50 flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 flex-1 px-2">
                        <Info size={14} className="text-indigo-400" />
                        Actions run sequentially. Time triggers are evaluated every second.
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleTest}
                            className="px-6 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all uppercase tracking-widest border border-indigo-500/30 flex items-center gap-2"
                        >
                            <Zap size={14} /> Test Rule
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-xs font-bold text-stone-400 hover:text-white transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSave)}
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-widest flex items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Activate Rule'}
                            {!isSubmitting && <ArrowRight size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
