import React, { useState, useEffect } from 'react';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { useAppStore } from '@/shared/store/app.store';
import { Settings, Plus, Edit2, Trash2, Zap, X, Save, Palette, Type, ArrowLeft } from 'lucide-react';
import { CreateCommandTemplateDto, IntercomTemplate } from '../api/intercom.service';
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

export const TemplateManager = () => {
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const { templates, createTemplate, updateTemplate, deleteTemplate, isMutating } = useIntercomTemplates(activeProductionId || undefined);

    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingTemplate, setEditingTemplate] = useState<IntercomTemplate | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name);
            setColor(editingTemplate.color || COLORS[0]);
        } else {
            setName('');
            setColor(COLORS[0]);
        }
    }, [editingTemplate]);

    const handleOpenForm = (template?: IntercomTemplate) => {
        setEditingTemplate(template || null);
        setView('form');
    };

    const handleBack = () => {
        setView('list');
        setEditingTemplate(null);
    };

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

            MySwal.fire({
                title: <p className="text-white font-black uppercase tracking-tighter">Éxito</p>,
                html: <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">{editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada correctamente'}</p>,
                icon: 'success',
                background: '#0c0a09',
                color: '#fff',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'border border-stone-800 rounded-3xl shadow-2xl',
                }
            });

            handleBack();
        } catch (error) {
            MySwal.fire({
                title: 'Error',
                text: 'No se pudo guardar la plantilla',
                icon: 'error',
                background: '#0c0a09',
                color: '#fff',
            });
        }
    };

    const handleDelete = async (id: string) => {
        const result = await MySwal.fire({
            title: <p className="text-white font-black uppercase tracking-tighter">¿Eliminar Plantilla?</p>,
            html: <p className="text-stone-400 text-xs font-bold uppercase tracking-widest text-center">Esta acción no se puede deshacer.</p>,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ELIMINAR',
            cancelButtonText: 'CANCELAR',
            background: '#0c0a09',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#292524',
            customClass: {
                popup: 'border border-stone-800 rounded-3xl shadow-2xl',
                confirmButton: 'rounded-xl font-black text-[10px] tracking-widest',
                cancelButton: 'rounded-xl font-black text-[10px] tracking-widest',
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteTemplate(id);
                MySwal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    background: '#0c0a09',
                    color: '#fff',
                    timer: 1000,
                    showConfirmButton: false
                });
            } catch (error) {
                MySwal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar la plantilla',
                    icon: 'error',
                    background: '#0c0a09',
                    color: '#fff',
                });
            }
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    setIsManagerOpen(true);
                    setView('list');
                }}
                className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-white transition-all shadow-lg group"
                title="Manage Templates"
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
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-stone-950 border border-stone-800 shadow-[0_40px_100px_rgba(0,0,0,1)] z-[2001] flex flex-col rounded-[24px] overflow-hidden max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900 shadow-sm relative z-10">
                                    <div className="flex items-center gap-3">
                                        {view === 'form' ? (
                                            <button
                                                onClick={handleBack}
                                                className="p-2 -ml-2 text-stone-500 hover:text-white transition-colors"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                        ) : (
                                            <div className="p-2 bg-indigo-500/10 rounded-xl">
                                                <Zap size={20} className="text-indigo-400" />
                                            </div>
                                        )}
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">
                                            {view === 'list' ? 'Plantillas de Alerta' : (editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla')}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsManagerOpen(false)}
                                        className="p-2 text-stone-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <AnimatePresence mode="wait">
                                    {view === 'list' ? (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[400px] bg-stone-950"
                                        >
                                            {templates.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-24 text-stone-700">
                                                    <Zap size={40} className="opacity-10 mb-4" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Sin configuraciones</p>
                                                </div>
                                            ) : (
                                                templates.map((template) => (
                                                    <motion.div
                                                        key={template.id}
                                                        layout
                                                        className="group p-4 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between hover:border-indigo-500 transition-all shadow-md"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="w-3.5 h-3.5 rounded-full shadow-lg"
                                                                style={{
                                                                    backgroundColor: template.color || '#444'
                                                                }}
                                                            />
                                                            <span className="text-xs font-bold text-white uppercase tracking-tight">
                                                                {template.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenForm(template)}
                                                                className="p-2 text-stone-500 hover:text-white transition-colors"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(template.id)}
                                                                className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex-1 p-6 space-y-6 bg-stone-950"
                                        >
                                            <form onSubmit={handleSave} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest">
                                                        <Type size={12} />
                                                        Texto de la Alerta
                                                    </label>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Ej: Prevenido, Al Aire, Zoom..."
                                                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-white placeholder:text-stone-700 focus:outline-none focus:border-indigo-500 transition-colors"
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
                                                                className={`h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-stone-950 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isMutating || !name.trim()}
                                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-stone-800 disabled:shadow-none"
                                                >
                                                    {isMutating ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Procesando...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={16} />
                                                            <span>{editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer (only for list view) */}
                                {view === 'list' && (
                                    <div className="p-6 border-t border-stone-800 bg-stone-900">
                                        <button
                                            onClick={() => handleOpenForm()}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} />
                                            Nueva Plantilla
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </Portal>
        </>
    );
};
