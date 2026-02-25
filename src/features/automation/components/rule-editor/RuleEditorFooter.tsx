import React from 'react';
import { Play, Activity, Save } from 'lucide-react';

interface RuleEditorFooterProps {
    onTest: () => void;
    onClose: () => void;
    onSave: (e: any) => void;
    isSubmitting: boolean;
    editingRule: any;
    actionCount: number;
}

export const RuleEditorFooter: React.FC<RuleEditorFooterProps> = ({
    onTest,
    onClose,
    onSave,
    isSubmitting,
    editingRule,
    actionCount
}) => {
    return (
        <div className="p-6 md:p-10 border-t border-card-border/50 bg-background/40 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onTest}
                    className="w-14 h-14 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl flex items-center justify-center transition-all   active:scale-90 group"
                    title="Dry Run Protocol"
                >
                    <Play size={24} className="group-hover:scale-110 transition-transform" />
                </button>
                <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase  mb-1">Instruction Set</p>
                    <p className="text-xs font-black text-foreground uppercase ">{actionCount} Logical Nodes Primed</p>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-8 py-5 text-[10px] font-black text-muted hover:text-foreground transition-all uppercase  rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95"
                >
                    Abort
                </button>
                <button
                    onClick={onSave}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-10 py-5 rounded-2xl transition-all   uppercase text-[10px]  flex items-center justify-center gap-4 active:scale-95 overflow-hidden group"
                >
                    {isSubmitting ? (
                        <Activity size={18} className="animate-spin" />
                    ) : (
                        <>
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            {editingRule ? 'Commit Changes' : 'Initialize Protocol'}
                        </>
                    )}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
};
