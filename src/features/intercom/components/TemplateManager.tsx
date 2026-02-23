import React, { useState, useEffect } from 'react';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { useAppStore } from '@/shared/store/app.store';
import { Settings, Zap, X, Save, Palette, Type, List, Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { CreateCommandTemplateDto, IntercomTemplate } from '../types/intercom.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/shared/components/Portal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#d946ef', // Pink
    '#64748b', // Slate
    '#444444', // Dark
];

export const TemplateManager = ({ productionId }: { productionId: string }) => {
    const { templates, createTemplate, updateTemplate, deleteTemplate, isMutating, refetch } = useIntercomTemplates(productionId);

    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [view, setView] = useState<'form' | 'list'>('form');
    const [editingTemplate, setEditingTemplate] = useState<IntercomTemplate | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name);
            setColor(editingTemplate.color || COLORS[0]);
            setView('form');
        } else {
            setName('');
            setColor(COLORS[0]);
        }
    }, [editingTemplate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isMutating) return;

        try {
            const data: CreateCommandTemplateDto = {
                name: name.trim(),
                color
            };

            if (editingTemplate) {
                await updateTemplate({ id: editingTemplate.id, data });
            } else {
                await createTemplate(data);
            }

            console.log(`[TemplateManager] Mutation success, awaiting data refetch...`);
            await refetch();
            console.log(`[TemplateManager] Refetch complete, showing success UI`);

            MySwal.fire({
                title: <p className="text-foreground font-black uppercase tracking-tighter">Éxito</p>,
                html: <p className="text-muted text-xs font-bold uppercase tracking-widest">{editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada correctamente'}</p>,
                icon: 'success',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'border border-card-border rounded-3xl shadow-2xl',
                }
            });

            if (editingTemplate) {
                setView('list');
                setEditingTemplate(null);
            } else {
                setIsManagerOpen(false);
            }
        } catch (error) {
            MySwal.fire({
                title: 'Error',
                text: 'No se pudo guardar la plantilla',
                icon: 'error',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
            });
        }
    };

    const handleDelete = async (id: string) => {
        const result = await MySwal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: 'var(--card-border)',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
        });

        if (result.isConfirmed) {
            try {
                await deleteTemplate(id);
                MySwal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    background: 'var(--card-bg)',
                    color: 'var(--foreground)',
                    timer: 1000,
                    showConfirmButton: false
                });
            } catch (error) {
                MySwal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la plantilla',
                    icon: 'error',
                    background: 'var(--card-bg)',
                    color: 'var(--foreground)',
                });
            }
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    setEditingTemplate(null);
                    setView('form');
                    setIsManagerOpen(true);
                }}
                className="p-2.5 bg-card-bg hover:bg-card-border/50 border border-card-border rounded-xl text-muted hover:text-foreground transition-all shadow-lg group"
                title="Nueva Plantilla"
            >
                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <Portal>
                <AnimatePresence>
                    {isManagerOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsManagerOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-card-border shadow-[0_40px_100px_rgba(0,0,0,1)] z-[2001] flex flex-col rounded-[24px] overflow-hidden max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-card-border flex items-center justify-between bg-card-bg shadow-sm relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                                            {view === 'form' ? <Zap size={20} className="text-indigo-400" /> : <List size={20} className="text-indigo-400" />}
                                        </div>
                                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                                            {view === 'list' ? 'Gestionar Plantillas' : editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {view === 'form' ? (
                                            <button
                                                onClick={() => setView('list')}
                                                className="p-2 text-stone-500 hover:text-indigo-400 transition-colors"
                                                title="Ver Lista"
                                            >
                                                <List size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingTemplate(null); setView('form'); }}
                                                className="p-2 text-muted hover:text-indigo-400 transition-colors"
                                                title="Nueva Plantilla"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsManagerOpen(false)}
                                            className="p-2 text-muted hover:text-foreground transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {view === 'form' ? (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="p-6 space-y-6"
                                            >
                                                <form onSubmit={handleSave} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                                                            <Type size={12} />
                                                            Texto de la Alerta
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="Ej: Prevenido, Al Aire, Zoom..."
                                                            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest">
                                                            <Palette size={12} />
                                                            Identificador Visual (Color)
                                                        </label>
                                                        <div className="grid grid-cols-5 gap-3">
                                                            {COLORS.map((c) => (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onClick={() => setColor(c)}
                                                                    className={`h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-stone-950 scale-110 shadow-lg' : 'hover:scale-105 hover:opacity-80'}`}
                                                                    style={{ backgroundColor: c }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 pt-4">
                                                        {editingTemplate && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setView('list')}
                                                                className="flex-1 py-4 bg-card-bg hover:bg-card-border text-muted rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-card-border flex items-center justify-center gap-2"
                                                            >
                                                                <ChevronLeft size={16} />
                                                                Volver
                                                            </button>
                                                        )}
                                                        <button
                                                            type="submit"
                                                            disabled={isMutating || !name.trim()}
                                                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-card-border disabled:shadow-none"
                                                        >
                                                            {isMutating ? (
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Save size={16} />
                                                                    <span>{editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="list"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="p-4 space-y-2"
                                            >
                                                {templates.length === 0 ? (
                                                    <div className="py-20 text-center space-y-4">
                                                        <Zap size={40} className="text-card-border mx-auto" strokeWidth={1} />
                                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest italic">
                                                            No hay plantillas configuradas
                                                        </p>
                                                        <button
                                                            onClick={() => setView('form')}
                                                            className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase underline decoration-2 underline-offset-4"
                                                        >
                                                            Crear la primera
                                                        </button>
                                                    </div>
                                                ) : (
                                                    templates.map((t) => (
                                                        <div
                                                            key={t.id}
                                                            className="group flex items-center justify-between p-4 bg-card-bg/40 border border-card-border rounded-2xl hover:border-indigo-400/50 transition-all"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-10 h-10 rounded-xl shadow-inner flex items-center justify-center"
                                                                    style={{ backgroundColor: t.color + '20' }}
                                                                >
                                                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">{t.name}</h4>
                                                                    <p className="text-[8px] font-bold text-muted uppercase tracking-widest mt-0.5">ID: {t.id.substring(0, 8)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setEditingTemplate(t)}
                                                                    className="p-2 text-muted hover:text-foreground hover:bg-card-border rounded-lg transition-all"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(t.id)}
                                                                    className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </Portal>
        </>
    );
};
