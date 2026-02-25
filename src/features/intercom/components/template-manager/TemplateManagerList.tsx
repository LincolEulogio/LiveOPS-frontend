import React from 'react';
import { Zap, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { IntercomTemplate } from '../../types/intercom.types';

interface TemplateManagerListProps {
    templates: IntercomTemplate[];
    onEdit: (t: IntercomTemplate) => void;
    onDelete: (id: string) => void;
    onCreateFirst: () => void;
}

export const TemplateManagerList: React.FC<TemplateManagerListProps> = ({
    templates,
    onEdit,
    onDelete,
    onCreateFirst
}) => {
    return (
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
                    <p className="text-[10px] font-black text-muted uppercase  italic">
                        No hay plantillas configuradas
                    </p>
                    <button
                        onClick={onCreateFirst}
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
                                className="w-10 h-10 rounded-xl  flex items-center justify-center"
                                style={{ backgroundColor: t.color + '20' }}
                            >
                                <div className="w-3 h-3 rounded-full " style={{ backgroundColor: t.color }} />
                            </div>
                            <div>
                                <h4 className="text-[12px] font-black text-foreground uppercase ">{t.name}</h4>
                                <p className="text-[8px] font-bold text-muted uppercase  mt-0.5">ID: {t.id.substring(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(t)}
                                className="p-2 text-muted hover:text-foreground hover:bg-card-border rounded-lg transition-all"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(t.id)}
                                className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </motion.div>
    );
};
