import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Mic, MicOff } from 'lucide-react';

interface CrewCardIdentityProps {
    userName: string;
    roleName: string;
    isOnline: boolean;
    onTalkStart?: () => void;
    onTalkStop?: () => void;
    isTalkingLocal?: boolean;
}

export const CrewCardIdentity: React.FC<CrewCardIdentityProps> = ({
    userName,
    roleName,
    isOnline,
    onTalkStart,
    onTalkStop,
    isTalkingLocal
}) => {
    return (
        <div className="p-6 sm:p-8 pb-4 flex items-center gap-4 sm:gap-6 relative z-10 w-full">
            <div className="relative group/avatar shrink-0">
                <div className={cn(
                    "w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center bg-black/20 dark:bg-background/60 text-foreground font-black text-lg sm:text-2xl border transition-all duration-500 group-hover/avatar:scale-105",
                    isOnline ? "border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "border-card-border text-muted"
                )}>
                    {userName.substring(0, 2).toUpperCase()}
                </div>
                {isOnline && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 sm:border-4 border-white dark:border-card-bg rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
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

            {onTalkStart && onTalkStop && isOnline && (
                <div className="flex items-center ml-auto">
                    <button
                        onMouseDown={onTalkStart}
                        onMouseUp={onTalkStop}
                        onMouseLeave={onTalkStop}
                        onTouchStart={onTalkStart}
                        onTouchEnd={onTalkStop}
                        className={cn(
                            "p-3 rounded-2xl border transition-all active:scale-90 flex flex-col items-center justify-center gap-1.5",
                            isTalkingLocal
                                ? "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                : "bg-white/5 border-white/10 text-muted hover:border-indigo-500/50 hover:text-indigo-400"
                        )}
                    >
                        {isTalkingLocal ? <Mic size={20} className="animate-bounce" /> : <MicOff size={20} />}
                        <span className="text-[8px] font-black uppercase ">Talk</span>
                    </button>
                </div>
            )}
        </div>
    );
};
