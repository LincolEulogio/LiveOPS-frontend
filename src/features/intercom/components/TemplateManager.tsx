'use client';

import React, { useState, useEffect } from 'react';
import { useIntercomTemplates } from '@/features/intercom/hooks/useIntercomTemplates';
import { Settings } from 'lucide-react';
import { CreateCommandTemplateDto, IntercomTemplate } from '@/features/intercom/types/intercom.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/shared/components/Portal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// New Sub-components
import { TemplateManagerHeader } from '@/features/intercom/components/template-manager/TemplateManagerHeader';
import { TemplateManagerForm } from '@/features/intercom/components/template-manager/TemplateManagerForm';
import { TemplateManagerList } from '@/features/intercom/components/template-manager/TemplateManagerList';

const MySwal = withReactContent(Swal);

const COLORS = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#d946ef',
    '#64748b',
    '#444444',
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

            await refetch();

            setIsManagerOpen(false); // Close modal on success

            MySwal.fire({
                title: <p className="text-foreground font-black uppercase tracking-tighter">Éxito</p>,
                html: <p className="text-muted text-xs font-bold uppercase tracking-widest">{editingTemplate ? 'Protocolo Actualizado' : 'Protocolo Creado'}</p>,
                icon: 'success',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    container: 'z-[10001]',
                    popup: 'border border-card-border rounded-[2.5rem] p-6 shadow-2xl',
                }
            });

            setEditingTemplate(null);
            setView('list');
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
        setIsManagerOpen(false); // Close modal IMMEDIATELY to avoid layering issues

        const result = await MySwal.fire({
            title: <p className="text-foreground font-black uppercase tracking-tighter">¿Purgar Protocolo?</p>,
            html: <p className="text-muted text-xs font-bold uppercase tracking-widest">Esta acción eliminará permanentemente esta instrucción.</p>,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: 'var(--card-border)',
            confirmButtonText: 'Sí, Eliminar',
            cancelButtonText: 'Abortar',
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
            customClass: {
                container: 'z-[10001]',
                popup: 'border border-card-border rounded-[2.5rem] p-6 shadow-2xl',
                confirmButton: 'rounded-2xl px-6 py-3 font-black uppercase text-xs tracking-widest',
                cancelButton: 'rounded-2xl px-6 py-3 font-black uppercase text-xs tracking-widest',
            }
        });

        if (result.isConfirmed) {
            try {
                await deleteTemplate(id);

                MySwal.fire({
                    title: <p className="text-foreground font-black uppercase tracking-tighter">Eliminado</p>,
                    html: <p className="text-muted text-xs font-bold uppercase tracking-widest">El protocolo ha sido removido de la matriz.</p>,
                    icon: 'success',
                    background: 'var(--card-bg)',
                    color: 'var(--foreground)',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        container: 'z-[10001]',
                        popup: 'border border-card-border rounded-[2.5rem] p-6 shadow-2xl',
                    }
                });
            } catch (error) {
                setIsManagerOpen(true); // Re-open on error if needed
                MySwal.fire({
                    title: 'Error',
                    text: 'No se pudo eliminar el protocolo',
                    icon: 'error',
                    background: 'var(--card-bg)',
                    color: 'var(--foreground)',
                    customClass: {
                        container: 'z-[10001]'
                    }
                });
            }
        } else {
            // If user cancels, re-open the manager
            setIsManagerOpen(true);
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
                className="flex-1 px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.08] text-muted-foreground dark:text-muted hover:text-foreground rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 border border-black/5 dark:border-white/5 flex items-center justify-center gap-2 sm:gap-3 group shadow-sm"
            >
                <Settings size={16} className="text-indigo-500 dark:text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
                <span className="tracking-widest">Alertas</span>
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
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card-bg/60 backdrop-blur-2xl border border-card-border z-[2001] flex flex-col rounded-[24px] overflow-hidden max-h-[85vh]"
                            >
                                <TemplateManagerHeader
                                    view={view}
                                    editingTemplate={editingTemplate}
                                    setView={setView}
                                    setEditingTemplate={setEditingTemplate}
                                    onClose={() => setIsManagerOpen(false)}
                                />

                                <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {view === 'form' ? (
                                            <TemplateManagerForm
                                                name={name}
                                                setName={setName}
                                                color={color}
                                                setColor={setColor}
                                                isMutating={isMutating}
                                                editingTemplate={editingTemplate}
                                                onSave={handleSave}
                                                onBack={() => setView('list')}
                                            />
                                        ) : (
                                            <TemplateManagerList
                                                templates={templates}
                                                onEdit={setEditingTemplate}
                                                onDelete={handleDelete}
                                                onCreateFirst={() => setView('form')}
                                            />
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
