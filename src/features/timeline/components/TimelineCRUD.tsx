'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TimelineBlock, CreateTimelineBlockDto } from '../types/timeline.types';
import { useTimeline } from '../hooks/useTimeline';
import { X, Clock, Type, AlignLeft, Hash, Video } from 'lucide-react';
import { useEffect } from 'react';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
            source: '',
            notes: '',
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
                await MySwal.fire({
                    title: '¡Actualizado!',
                    text: 'El bloque ha sido actualizado correctamente.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#1c1917',
                    color: '#fff'
                });
            } else {
                await createBlock({ ...data, order: nextOrder });
                await MySwal.fire({
                    title: '¡Creado!',
                    text: 'Nuevo bloque añadido a la escaleta.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#1c1917',
                    color: '#fff'
                });
            }
            onClose();
        } catch (err: any) {
            console.error('Detailed Save Error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido al guardar el bloque';

            await MySwal.fire({
                title: 'Error al guardar',
                text: errorMessage,
                icon: 'error',
                background: '#1c1917',
                color: '#fff',
                confirmButtonColor: '#4f46e5'
            });
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
            <div className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-card-border">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        {editingBlock ? 'Editar Bloque' : 'Añadir Bloque a Escaleta'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground p-1 hover:bg-card-border rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <Type size={16} className="text-indigo-400" />
                            Título
                        </label>
                        <input
                            {...register('title')}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Ej: Intro y Bienvenida"
                        />
                        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <AlignLeft size={16} className="text-indigo-400" />
                            Descripción
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                            placeholder="Detalles del segmento..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                                <Clock size={16} className="text-indigo-400" />
                                Duración (ms)
                            </label>
                            <input
                                type="number"
                                {...register('durationMs', { valueAsNumber: true })}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                                <Video size={16} className="text-indigo-400" />
                                Fuente
                            </label>
                            <input
                                {...register('source')}
                                className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                placeholder="Ej: CAM 1, VTR"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <Hash size={16} className="text-indigo-400" />
                            Escena Vinculada (OBS)
                        </label>
                        <input
                            {...register('linkedScene')}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            placeholder="Nombre exacto en OBS"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <AlignLeft size={16} className="text-indigo-400" />
                            Notas Internas
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={2}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                            placeholder="Notas privadas para el equipo..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-background hover:bg-card-border text-foreground font-semibold rounded-xl border border-card-border transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {isSubmitting ? 'Guardando...' : editingBlock ? 'Actualizar' : 'Crear Bloque'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
