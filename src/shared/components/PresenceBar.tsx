'use client';

import React from 'react';
import { usePresence } from '@/shared/hooks/usePresence';
import { cn } from '@/shared/utils/cn';
import { Users } from 'lucide-react';

export const PresenceBar = () => {
    const { members } = usePresence();

    if (members.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
                {members.map((member) => (
                    <div
                        key={member.userId}
                        className={cn(
                            "inline-block h-8 w-8 rounded-full ring-2 ring-background bg-card-bg flex items-center justify-center border border-card-border group relative cursor-help",
                            member.status !== 'IDLE' && "ring-indigo-500/50"
                        )}
                        title={`${member.userName} (${member.roleName})`}
                    >
                        <span className="text-[10px] font-black text-muted group-hover:text-foreground transition-colors">
                            {member.userName.charAt(0).toUpperCase()}
                        </span>

                        {/* Tooltip hint */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card-bg border border-card-border rounded text-[9px] font-bold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none  z-50">
                            {member.userName}
                            <span className="block text-muted uppercase text-[7px]">{member.roleName}</span>
                            {member.status !== 'IDLE' && (
                                <span className="block text-indigo-400 text-[7px] mt-1 border-t border-card-border pt-1">
                                    {member.status}
                                </span>
                            )}
                        </div>

                        {/* Status dot */}
                        <span className={cn(
                            "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-background",
                            member.status === 'IDLE' ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                        )} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col ml-1">
                <span className="text-[9px] font-black text-muted uppercase er leading-none">Equipo</span>
                <span className="text-[10px] font-bold text-foreground leading-none mt-1">{members.length}</span>
            </div>
        </div>
    );
};
