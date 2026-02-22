import React, { useState } from 'react';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { useAppStore } from '@/shared/store/app.store';
import { Settings, Plus, Edit2, Trash2, Zap, X } from 'lucide-react';
import { TemplateModal } from './TemplateModal';
import { CreateCommandTemplateDto, IntercomTemplate } from '../api/intercom.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/shared/components/Portal';

export const TemplateManager = () => {
    const activeProductionId = useAppStore((state) => state.activeProductionId);
    const { templates, createTemplate, updateTemplate, deleteTemplate, isMutating } = useIntercomTemplates(activeProductionId || undefined);

    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<IntercomTemplate | null>(null);

    const handleOpenModal = (template?: IntercomTemplate) => {
        setEditingTemplate(template || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: CreateCommandTemplateDto) => {
        if (editingTemplate) {
            await updateTemplate({ id: editingTemplate.id, data });
        } else {
            await createTemplate(data);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsManagerOpen(true)}
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
                                className="fixed inset-0 bg-black z-[2000]"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-stone-950 border border-stone-800 shadow-[0_40px_100px_rgba(0,0,0,1)] z-[2001] flex flex-col rounded-[24px] overflow-hidden max-h-[85vh]"
                            >
                                <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900 shadow-sm relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                                            <Zap size={20} className="text-indigo-400" />
                                        </div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest">
                                            Plantillas de Alerta
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsManagerOpen(false)}
                                        className="p-2 text-stone-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[400px] bg-stone-950">
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
                                                        onClick={() => handleOpenModal(template)}
                                                        className="p-2 text-stone-500 hover:text-white transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTemplate(template.id)}
                                                        className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                <div className="p-6 border-t border-stone-800 bg-stone-900">
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Nueva Plantilla
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </Portal>

            <TemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                template={editingTemplate}
                isMutating={isMutating}
            />
        </>
    );
};
