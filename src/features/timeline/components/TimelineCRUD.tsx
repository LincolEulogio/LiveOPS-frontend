'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TimelineBlock, CreateTimelineBlockDto } from '../types/timeline.types';
import { useTimeline } from '../hooks/useTimeline';
import { X, Clock, Type, AlignLeft, Hash, Video } from 'lucide-react';
import { useEffect } from 'react';

const blockSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    durationMs: z.number().min(0, 'Duration must be positive'),
    linkedScene: z.string().optional(),
});

type FormValues = {
    title: string;
    description?: string;
    source?: string;
    notes?: string;
    durationMs: number;
    linkedScene?: string;
};

interface Props {
    productionId: string;
    isOpen: boolean;
    onClose: () => void;
    editingBlock?: TimelineBlock;
    nextOrder: number;
}

export const TimelineCRUD = ({
    productionId,
    isOpen,
    onClose,
    editingBlock,
    nextOrder
}: Props) => {
    const { createBlock, updateBlock } = useTimeline(productionId);

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
            durationMs: 300000, // 5 minutes default
            linkedScene: '',
        },
    });

    useEffect(() => {
        if (editingBlock) {
            reset({
                title: editingBlock.title,
                description: editingBlock.description || '',
                source: editingBlock.source || '',
                notes: editingBlock.notes || '',
                durationMs: editingBlock.durationMs,
                linkedScene: editingBlock.linkedScene || '',
            });
        } else {
            reset({
                title: '',
                description: '',
                source: '',
                notes: '',
                durationMs: 300000,
                linkedScene: '',
            });
        }
    }, [editingBlock, reset, isOpen]);

    const onSubmit = async (data: FormValues) => {
        try {
            if (editingBlock) {
                await updateBlock({ id: editingBlock.id, data: data });
            } else {
                await createBlock({ ...data, order: nextOrder });
            }
            onClose();
        } catch (err) {
            console.error('Failed to save block:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Dialog */}
            <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-stone-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingBlock ? 'Edit Block' : 'Add Timeline Block'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white p-1 hover:bg-stone-800 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                            <Type size={16} className="text-indigo-400" />
                            Title
                        </label>
                        <input
                            {...register('title')}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                            placeholder="e.g., Intro & Welcome"
                        />
                        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                            <AlignLeft size={16} className="text-indigo-400" />
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                            placeholder="Add some details about this segment..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                                <Clock size={16} className="text-indigo-400" />
                                Duration (ms)
                            </label>
                            <input
                                type="number"
                                {...register('durationMs', { valueAsNumber: true })}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                                <Video size={16} className="text-indigo-400" />
                                Source / Fuente
                            </label>
                            <input
                                {...register('source')}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                placeholder="e.g. CAM 1, VTR"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                            <Hash size={16} className="text-indigo-400" />
                            Linked Scene (Automation)
                        </label>
                        <input
                            {...register('linkedScene')}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            placeholder="OBS Scene Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                            <AlignLeft size={16} className="text-indigo-400" />
                            Internal Notes
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={2}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-white placeholder:text-stone-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                            placeholder="Private notes for the team..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold rounded-xl border border-stone-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {isSubmitting ? 'Saving...' : editingBlock ? 'Update Block' : 'Create Block'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
