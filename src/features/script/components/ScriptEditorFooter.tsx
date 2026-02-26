import React from 'react';
import { Cloud } from 'lucide-react';

export const ScriptEditorFooter = ({ isSyncing }: { isSyncing: boolean }) => (
    <div className="p-3 bg-white/5 border-t border-card-border/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-pulse' : ''} `} />
            <span className="text-[9px] text-muted font-black uppercase ">
                Live Sync: {isSyncing ? 'Pushing Changes...' : 'Synchronized'}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <Cloud size={12} className="text-muted" />
            <span className="text-[9px] text-muted/60 font-black uppercase ">
                v1.4.2-STABLE
            </span>
        </div>
    </div>
);
