'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ChatHeaderProps {
    isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isConnected }) => {
    return (
        <div className="p-4 border-b border-card-border/50 bg-card-bg/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <MessageSquare size={18} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xs font-black text-foreground uppercase ">Team Chat</h3>
                    <p className="text-[9px] text-muted font-bold uppercase er flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")} />
                        {isConnected ? "En línea" : "Desconectado"}
                    </p>
                </div>
            </div>
        </div>
    );
};
