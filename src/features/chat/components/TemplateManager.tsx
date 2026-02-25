'use client';

import { useState } from 'react';
import { CommandTemplate } from '../types/chat.types';
import { X, Plus, Trash2, Zap } from 'lucide-react';

interface Props {
    templates: CommandTemplate[];
    onCreate: (dto: any) => Promise<any>;
    onDelete: (id: string) => Promise<any>;
    onClose: () => void;
}

export const TemplateManager = ({ templates, onCreate, onDelete, onClose }: Props) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await onCreate({ name: name.trim(), description: '', icon: 'zap', color: 'indigo' });
            setName('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl  overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-card-border">
                    <h3 className="text-sm font-bold text-foreground uppercase  flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" />
                        Manage Presets
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-card-border rounded-lg text-muted hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {templates.length === 0 ? (
                            <p className="text-xs text-muted text-center py-4">No presets created yet.</p>
                        ) : (
                            templates.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-background border border-card-border rounded-xl group/item">
                                    <div className="flex items-center gap-3">
                                        <Zap size={14} className="text-muted" />
                                        <span className="text-xs font-medium text-foreground uppercase">{t.name}</span>
                                    </div>
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Create Form */}
                    <form onSubmit={handleSubmit} className="pt-4 border-t border-card-border">
                        <div className="flex gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Preset name (e.g. READY)"
                                className="flex-1 bg-background border border-card-border rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!name.trim() || isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all  "
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
