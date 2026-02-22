'use client';

import React from 'react';
import { usePresence } from '../hooks/usePresence';
import { cn } from '../utils/cn';
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
                            "inline-block h-8 w-8 rounded-full ring-2 ring-stone-950 bg-stone-900 flex items-center justify-center border border-stone-800 group relative cursor-help",
                            member.status !== 'IDLE' && "ring-indigo-500/50"
                        )}
                        title={`${member.userName} (${member.roleName})`}
                    >
                        <span className="text-[10px] font-black text-stone-400 group-hover:text-white transition-colors">
                            {member.userName.charAt(0).toUpperCase()}
                        </span>

                        {/* Tooltip hint */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-[9px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                            {member.userName}
                            <span className="block text-stone-500 uppercase text-[7px]">{member.roleName}</span>
                            {member.status !== 'IDLE' && (
                                <span className="block text-indigo-400 text-[7px] mt-0.5 mt-1 border-t border-stone-800 pt-1">
                                    {member.status}
                                </span>
                            )}
                        </div>

                        {/* Status dot */}
                        <span className={cn(
                            "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-stone-950",
                            member.status === 'IDLE' ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                        )} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col ml-1">
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-tighter leading-none">Equipo</span>
                <span className="text-[10px] font-bold text-white leading-none mt-1">{members.length}</span>
            </div>
        </div>
    );
};
