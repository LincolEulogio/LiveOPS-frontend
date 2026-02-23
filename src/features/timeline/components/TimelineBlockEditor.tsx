'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TimelineBlock, CreateTimelineBlockDto, UpdateTimelineBlockDto } from '../types/timeline.types';
import { X, Clock, Monitor, Settings2, Info, ArrowRight, Type, AlignLeft } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/shared/utils/cn';

const blockSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    durationMs: z.number().min(0, 'Duration must be positive'),
    linkedScene: z.string().optional(),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof blockSchema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dto: FormValues) => Promise<void>;
    editingBlock?: TimelineBlock;
}

export const TimelineBlockEditor = ({ isOpen, onClose, onSave, editingBlock }: Props) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(blockSchema),
        defaultValues: {
            title: '',
            description: '',
            durationMs: 300000, // 5 mins
            linkedScene: '',
            notes: '',
        },
    });

    useEffect(() => {
        if (editingBlock && isOpen) {
            reset({
                title: editingBlock.title,
                description: editingBlock.description || '',
                durationMs: editingBlock.durationMs || 300000,
                linkedScene: editingBlock.linkedScene || '',
                notes: editingBlock.notes || '',
            });
        } else if (!editingBlock && isOpen) {
            reset({
                title: '',
                description: '',
                durationMs: 300000,
                linkedScene: '',
                notes: '',
            });
        }
    }, [editingBlock, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-card-border bg-background">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                {editingBlock ? 'Edit Segment' : 'New Show Segment'}
                            </h2>
                            <p className="text-xs text-muted">Configure block details and automations.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-foreground p-2 hover:bg-card-border rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                            <Type size={12} />
                            Segment Title
                        </label>
                        <input
                            {...register('title')}
                            placeholder="e.g., Opening Intro"
                            className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                        {errors.title && <p className="text-[10px] text-red-400 ml-1">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                            <AlignLeft size={12} />
                            Short Description
                        </label>
                        <input
                            {...register('description')}
                            placeholder="Briefly describe this segment..."
                            className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                                <Clock size={12} />
                                Duration (ms)
                            </label>
                            <input
                                type="number"
                                {...register('durationMs', { valueAsNumber: true })}
                                className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>

                        {/* Linked Scene */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1 flex items-center gap-2">
                                <Monitor size={12} />
                                Linked OBS Scene
                            </label>
                            <input
                                {...register('linkedScene')}
                                placeholder="Scene name..."
                                className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Internal Production Notes</label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            placeholder="Add tips for the operator or script cues..."
                            className="w-full bg-background border border-card-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-card-border bg-background flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-bold text-muted hover:text-foreground transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSave)}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase text-xs tracking-widest flex items-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : editingBlock ? 'Update Segment' : 'Add to Escaleta'}
                        {!isSubmitting && <ArrowRight size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
