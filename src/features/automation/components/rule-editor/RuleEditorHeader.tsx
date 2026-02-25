import React from 'react';
import { Zap, ArrowRight, X } from 'lucide-react';

interface RuleEditorHeaderProps {
    editingRule: any;
    productionId: string;
    onClose: () => void;
}

export const RuleEditorHeader: React.FC<RuleEditorHeaderProps> = ({ editingRule, productionId, onClose }) => {
    return (
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-card-border/50 bg-white/5 relative z-10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 ">
                    <Zap size={32} className="text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase  leading-none mb-2">
                        {editingRule ? 'Modify Interaction' : 'Initialize Logic'}
                    </h2>
                    <div className="flex flex-wrap gap-2 items-center text-[10px] font-black uppercase ">
                        <span className="text-indigo-400/90">Dynamic Gateway</span>
                        <ArrowRight size={10} className="text-foreground/20" />
                        <span className="text-foreground/40">Rule Configurator</span>
                        <ArrowRight size={10} className="text-foreground/20" />
                        <span className="p-1 px-2 bg-white/5 rounded-md border border-card-border text-foreground/50">{productionId.slice(0, 8)}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-3 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 rounded-2xl transition-all active:scale-90"
            >
                <X size={28} />
            </button>
        </div>
    );
};
