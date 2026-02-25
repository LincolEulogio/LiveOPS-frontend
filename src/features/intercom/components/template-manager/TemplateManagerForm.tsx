import React from 'react';
import { Type, Palette, ChevronLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface TemplateManagerFormProps {
    name: string;
    setName: (val: string) => void;
    color: string;
    setColor: (val: string) => void;
    isMutating: boolean;
    editingTemplate: any;
    onSave: (e: React.FormEvent) => void;
    onBack: () => void;
}

export const TemplateManagerForm: React.FC<TemplateManagerFormProps> = ({
    name,
    setName,
    color,
    setColor,
    isMutating,
    editingTemplate,
    onSave,
    onBack
}) => {
    return (
        <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 space-y-6"
        >
            <form onSubmit={onSave} className="space-y-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase ">
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
                    <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase ">
                        <Palette size={12} />
                        Identificador Visual (Color)
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-background scale-110 ' : 'hover:scale-105 hover:opacity-80'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    {editingTemplate && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 py-4 bg-card-bg hover:bg-card-border text-muted rounded-xl font-black text-xs uppercase  transition-all border border-card-border flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={16} />
                            Volver
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isMutating || !name.trim()}
                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase  transition-all   flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-card-border"
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
    );
};
