'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rule, CreateRuleDto } from '../types/automation.types';
import { X, Plus, Trash2, Zap, Play, ArrowRight, Settings2, Info } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/shared/utils/cn';

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
    isOpen: boolean;
    onClose: () => void;
    onSave: (dto: any) => Promise<void>;
    editingRule?: Rule;
}

const EVENT_TYPES = [
    { value: 'obs.scene.changed', label: 'OBS Scene Changed' },
    { value: 'obs.stream.state', label: 'OBS Stream State' },
    { value: 'obs.record.state', label: 'OBS Record State' },
    { value: 'vmix.input.changed', label: 'vMix Input Changed' },
    { value: 'vmix.connection.state', label: 'vMix Connection State' },
    { value: 'timeline.updated', label: 'Timeline Updated' },
    { value: 'timeline.intercom.trigger', label: 'Timeline Intercom Trigger' },
];

const ACTION_TYPES = [
    { value: 'obs.changeScene', label: 'OBS: Change Scene' },
    { value: 'vmix.cut', label: 'vMix: Cut' },
    { value: 'vmix.fade', label: 'vMix: Fade' },
    { value: 'vmix.changeInput', label: 'vMix: Change Input' },
    { value: 'webhook.call', label: 'HTTP: Call Webhook' },
];

export const RuleEditor = ({ isOpen, onClose, onSave, editingRule }: Props) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            name: '',
            description: '',
            isEnabled: true,
            triggers: [{ eventType: 'obs.scene.changed' }],
            actions: [{ actionType: 'obs.changeScene', order: 0 }],
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

    useEffect(() => {
        if (editingRule) {
            reset({
                name: editingRule.name,
                description: editingRule.description || '',
                isEnabled: editingRule.isEnabled,
                triggers: editingRule.triggers.map(t => ({ eventType: t.eventType, condition: t.condition })),
                actions: editingRule.actions.map(a => ({ actionType: a.actionType, payload: a.payload, order: a.order })),
            });
        } else {
            reset({
                name: '',
                description: '',
                isEnabled: true,
                triggers: [{ eventType: 'obs.scene.changed' }],
                actions: [{ actionType: 'obs.changeScene', order: 0 }],
            });
        }
    }, [editingRule, reset, isOpen]);

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
                                placeholder="e.g., Auto Cut to Black"
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder:text-stone-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                            {errors.name && <p className="text-[10px] text-red-400 ml-1">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Description</label>
                            <input
                                {...register('description')}
                                placeholder="Optional description..."
                                className="w-full bg-stone-950 border border-stone-800 rounded-2xl px-4 py-3 text-white placeholder:text-stone-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-stone-800/50"></div>

                    {/* Triggers */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" />
                                Triggers
                            </h3>
                            <button
                                type="button"
                                onClick={() => appendTrigger({ eventType: 'obs.scene.changed' })}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Trigger
                            </button>
                        </div>

                        <div className="space-y-3">
                            {triggerFields.map((field, index) => (
                                <div key={field.id} className="flex gap-3 items-end bg-stone-950/40 p-4 rounded-2xl border border-stone-800/50 group">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Event Type</label>
                                        <select
                                            {...register(`triggers.${index}.eventType`)}
                                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        >
                                            {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTrigger(index)}
                                        className="p-2.5 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl mb-0.5 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center py-2">
                        <div className="w-px h-8 bg-stone-800"></div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Play size={14} className="text-indigo-400" />
                                Actions Sequence
                            </h3>
                            <button
                                type="button"
                                onClick={() => appendAction({ actionType: 'obs.changeScene', order: actionFields.length })}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Add Action
                            </button>
                        </div>

                        <div className="space-y-3">
                            {actionFields.map((field, index) => (
                                <div key={field.id} className="relative flex gap-3 items-end bg-stone-950/40 p-4 rounded-2xl border border-stone-800/50 group animate-in slide-in-from-left-2 duration-300">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-500 ring-4 ring-stone-900">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2 ml-2">
                                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Action Type</label>
                                        <select
                                            {...register(`actions.${index}.actionType`)}
                                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-300 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        >
                                            {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAction(index)}
                                        className="p-2.5 text-stone-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl mb-0.5 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-stone-800 bg-stone-900/50 flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 flex-1 px-2">
                        <Info size={14} className="text-indigo-400" />
                        Actions run sequentially in the order defined above.
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-stone-400 hover:text-white transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSave)}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-widest"
                    >
                        {isSubmitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Activate Rule'}
                    </button>
                </div>
            </div>
        </div>
    );
};
