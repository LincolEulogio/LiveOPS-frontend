import React from 'react';
import { Battery, Wifi, ExternalLink, Mic } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

interface CrewCardHeaderProps {
    productionId: string;
    userId: string;
    isOnline: boolean;
    isTalking?: boolean;
}

export const CrewCardHeader: React.FC<CrewCardHeaderProps> = ({ productionId, userId, isOnline, isTalking }) => {
    return (
        <div className="px-6 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Battery size={10} className="text-muted" />
                    <Wifi size={10} className="text-muted" />
                    <div className="w-[1px] h-2 bg-card-border mx-1" />
                    <span className="text-[8px] font-black text-muted uppercase ">{isOnline ? 'Active Link' : 'Dark Node'}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isTalking && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <Mic size={12} className="text-red-500" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-[1px]">TALKING</span>
                        <div className="flex items-center gap-[2px] h-3">
                            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] h-full"></div>
                            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.9s_infinite] h-2/3"></div>
                            <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.7s_infinite] h-full"></div>
                        </div>
                    </div>
                )}
                <Link
                    href={`/productions/${productionId}/intercom/member/${userId}`}
                    target="_blank"
                    className="p-2.5 bg-background/50 backdrop-blur-md rounded-xl text-muted hover:text-indigo-400 transition-all border border-card-border hover:border-indigo-500/50 active:scale-90"
                >
                    <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
};
