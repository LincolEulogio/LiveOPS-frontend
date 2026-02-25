'use client';

import React, { useState, useEffect } from 'react';
import { useIntercomTemplates } from '../hooks/useIntercomTemplates';
import { Settings } from 'lucide-react';
import { CreateCommandTemplateDto, IntercomTemplate } from '../types/intercom.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Portal } from '@/shared/components/Portal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// New Sub-components
import { TemplateManagerHeader } from './template-manager/TemplateManagerHeader';
import { TemplateManagerForm } from './template-manager/TemplateManagerForm';
import { TemplateManagerList } from './template-manager/TemplateManagerList';

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

            MySwal.fire({
                title: <p className="text-foreground font-black uppercase er">Éxito</p>,
                html: <p className="text-muted text-xs font-bold uppercase ">{editingTemplate ? 'Plantilla actualizada' : 'Plantilla creada correctamente'}</p>,
                icon: 'success',
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'border border-card-border rounded-3xl ',
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
                className="p-2.5 bg-card-bg hover:bg-card-border/50 border border-card-border rounded-xl text-muted hover:text-foreground transition-all  group"
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
