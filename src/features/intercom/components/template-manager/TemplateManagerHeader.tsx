import React from 'react';
import { Zap, List, Plus, X } from 'lucide-react';

interface TemplateManagerHeaderProps {
    view: 'form' | 'list';
    editingTemplate: any;
    setView: (view: 'form' | 'list') => void;
    setEditingTemplate: (t: any) => void;
    onClose: () => void;
}

export const TemplateManagerHeader: React.FC<TemplateManagerHeaderProps> = ({
    view,
    editingTemplate,
    setView,
    setEditingTemplate,
    onClose
}) => {
    return (
        <div className="p-6 border-b border-card-border flex items-center justify-between bg-card-bg  relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    {view === 'form' ? <Zap size={20} className="text-indigo-400" /> : <List size={20} className="text-indigo-400" />}
                </div>
                <h2 className="text-sm font-black text-foreground uppercase ">
                    {view === 'list' ? 'Gestionar Plantillas' : editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </h2>
            </div>
            <div className="flex items-center gap-2">
                {view === 'form' ? (
                    <button
                        onClick={() => setView('list')}
                        className="p-2 text-muted hover:text-indigo-400 transition-colors"
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
                    onClick={onClose}
                    className="p-2 text-muted hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
