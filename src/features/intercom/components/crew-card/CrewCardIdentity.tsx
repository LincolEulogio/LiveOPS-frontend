import React from 'react';
import { cn } from '@/shared/utils/cn';

interface CrewCardIdentityProps {
    userName: string;
    roleName: string;
    isOnline: boolean;
}

export const CrewCardIdentity: React.FC<CrewCardIdentityProps> = ({ userName, roleName, isOnline }) => {
    return (
        <div className="p-8 pb-4 flex items-center gap-6 relative z-10">
            <div className="relative group/avatar">
                <div className={cn(
                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center bg-background/60 text-foreground font-black text-2xl border  transition-all duration-500 group-hover/avatar:scale-110",
                    isOnline ? "border-indigo-500/30 text-indigo-400" : "border-card-border text-muted"
                )}>
                    {userName.substring(0, 2).toUpperCase()}
                </div>
                {isOnline && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-card-bg rounded-full  animate-pulse" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase ">
                        {roleName}
                    </span>
                </div>
                <h3 className="text-xl font-black text-foreground uppercase er truncate italic leading-none group-hover:text-indigo-400 transition-colors">
                    {userName}
                </h3>
            </div>
        </div>
    );
};
