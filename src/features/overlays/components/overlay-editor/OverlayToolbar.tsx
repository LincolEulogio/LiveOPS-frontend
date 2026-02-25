'use client';

import React from 'react';
import { Type, Image as ImageIcon, Box, Save, Layout, Shield } from 'lucide-react';
import { OverlayLayer } from '@/features/overlays/types/overlay.types';

interface OverlayToolbarProps {
    onAddLayer: (type: OverlayLayer['type']) => void;
    onAddTemplate: (template: string) => void;
    onSave: () => void;
}

export const OverlayToolbar: React.FC<OverlayToolbarProps> = ({ onAddLayer, onAddTemplate, onSave }) => {
    return (
        <div className="w-full md:w-16 h-14 md:h-full bg-card-bg border-b md:border-b-0 md:border-r border-card-border flex flex-row md:flex-col items-center justify-center md:justify-start md:py-6 gap-2 sm:gap-6 px-4 md:px-0">
            <button onClick={() => onAddLayer('text')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Text">
                <Type size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={() => onAddLayer('image')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Image">
                <ImageIcon size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={() => onAddLayer('shape')} className="p-3 text-muted hover:text-foreground transition-colors" title="Add Shape">
                <Box size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="h-px w-8 md:w-auto md:h-px bg-card-border my-2 md:mx-4" />

            <button onClick={() => onAddTemplate('lower-third')} className="p-3 text-indigo-400 hover:text-indigo-300 transition-colors" title="Add Lower Third Template">
                <Layout size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={() => onAddTemplate('bug')} className="p-3 text-pink-400 hover:text-pink-300 transition-colors" title="Add Bug Logo Template">
                <Shield size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="md:mt-auto flex flex-col gap-4">
                <button onClick={onSave} className="p-2 sm:p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors   active:scale-95">
                    <Save size={18} className="md:w-5 md:h-5" />
                </button>
            </div>
        </div>
    );
};
