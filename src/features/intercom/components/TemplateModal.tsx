import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Palette, Type } from 'lucide-react';
import { IntercomTemplate, CreateCommandTemplateDto } from '../api/intercom.service';
import { Portal } from '@/shared/components/Portal';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateCommandTemplateDto) => Promise<void>;
    template?: IntercomTemplate | null;
    isMutating: boolean;
}

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
];

export const TemplateModal = ({ isOpen, onClose, onSave, template, isMutating }: TemplateModalProps) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setColor(template.color || COLORS[0]);
        } else {
            setName('');
            setColor(COLORS[0]);
        }
    }, [template]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        await onSave({
            name: name.trim(),
            color
        });
        onClose();
    };

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black z-[3000]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-stone-950 border border-stone-800 shadow-[0_40px_100px_rgba(0,0,0,1)] z-[3001] overflow-hidden rounded-[24px]"
                        >
                            <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900 shadow-sm relative z-10">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                                    {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
                                </h2>
                                <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-stone-950 relative z-0">
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
                                                className={`h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-stone-950 scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isMutating || !name.trim()}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {template ? 'Guardar Cambios' : 'Crear Plantilla'}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </Portal>
    );
};
