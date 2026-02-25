import React from 'react';
import { Battery, Wifi, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/utils/cn';

interface CrewCardHeaderProps {
    productionId: string;
    userId: string;
    isOnline: boolean;
}

export const CrewCardHeader: React.FC<CrewCardHeaderProps> = ({ productionId, userId, isOnline }) => {
    return (
        <div className="px-8 pt-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Battery size={10} className="text-muted" />
                    <Wifi size={10} className="text-muted" />
                    <div className="w-[1px] h-2 bg-card-border mx-1" />
                    <span className="text-[8px] font-black text-muted uppercase ">{isOnline ? 'Active Link' : 'Dark Node'}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
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
