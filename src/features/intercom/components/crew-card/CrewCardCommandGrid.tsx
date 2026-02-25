import React from 'react';
import { ZoomIn, ZoomOut, Radio, Clock, CheckCircle2, Video, Zap, Activity } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { IntercomTemplate } from '@/features/intercom/types/intercom.types';

interface CrewCardCommandGridProps {
    templates: IntercomTemplate[];
    isOnline: boolean;
    currentStatus: string;
    onSendCommand: (template: IntercomTemplate) => void;
}

const getIconForTemplate = (name: string, color: string) => {
    const n = name.toUpperCase();
    const props = { size: 16, style: { color } };

    if (n.includes('ZOOM') && n.includes('MÁS')) return <ZoomIn {...props} />;
    if (n.includes('ZOOM') && n.includes('MENOS')) return <ZoomOut {...props} />;
    if (n.includes('AL AIRE')) return <Radio className="text-red-500 animate-pulse" size={16} />;
    if (n.includes('PREVENIDO')) return <Clock {...props} />;
    if (n.includes('LIBRE') || n.includes('READY')) return <CheckCircle2 {...props} />;
    if (n.includes('PLANO') || n.includes('GENERAL')) return <Video {...props} />;
    if (n.includes('CLOSE') || n.includes('FOCO')) return <Zap {...props} />;

    return <Activity {...props} />;
};

export const CrewCardCommandGrid: React.FC<CrewCardCommandGridProps> = ({
    templates,
    isOnline,
    currentStatus,
    onSendCommand
}) => {
    return (
        <div className="px-6 pb-6 grid grid-cols-2 gap-3 min-h-[180px]">
            {templates.slice(0, 8).map(t => {
                const isPending = isOnline && currentStatus === t.name.toUpperCase();

                return (
                    <button
                        key={t.id}
                        onClick={() => onSendCommand(t)}
                        disabled={!isOnline}
                        className={cn(
                            "group/btn relative p-4 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center gap-2 overflow-hidden",
                            isOnline
                                ? 'bg-background/40 border-card-border hover:border-indigo-500/50 hover:bg-indigo-500/5'
                                : 'bg-background/20 border-white/5 cursor-not-allowed grayscale'
                        )}
                    >
                        {/* Visual Glow */}
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />

                        <div className="relative z-10 transition-transform group-hover/btn:scale-125 duration-500">
                            {getIconForTemplate(t.name, t.color || '#6366f1')}
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase  relative z-10 transition-colors",
                            isPending ? 'text-indigo-400' : 'text-muted/80 group-hover/btn:text-foreground'
                        )}>
                            {t.name}
                        </span>

                        {isPending && (
                            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse " />
                        )}
                    </button>
                );
            })}
            {templates.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 opacity-30 border-2 border-dashed border-card-border/60 rounded-[2rem] gap-4">
                    <Radio size={32} strokeWidth={1} className="text-muted" />
                    <span className="text-[10px] font-black uppercase  text-muted">Protocols Null</span>
                </div>
            )}
        </div>
    );
};
