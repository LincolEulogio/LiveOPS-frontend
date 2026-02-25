import { SocialMessage } from '../hooks/useSocial';
import { cn } from '@/shared/utils/cn';
import { Check, X, Tv } from 'lucide-react';

interface Props {
    message: SocialMessage;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onSendToAir?: (id: string) => void;
    className?: string;
}

export const SocialMessageCard = ({ message, onApprove, onReject, onSendToAir, className }: Props) => {

    const isTwitch = message.platform === 'twitch';

    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all relative overflow-hidden group",
            message.status === 'PENDING' ? "bg-background border-card-border" :
                message.status === 'APPROVED' ? "bg-emerald-900/20 border-emerald-500/30" :
                    message.status === 'ON_AIR' ? "bg-indigo-900/40 border-indigo-500" :
                        "bg-red-900/10 border-red-500/20 opacity-50",
            className
        )}>
            {message.status === 'ON_AIR' && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold uppercase  rounded-bl-lg">
                    On Air
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-card-bg flex shrink-0 items-center justify-center overflow-hidden border border-card-border">
                    {message.authorAvatar ? (
                        <img src={message.authorAvatar} alt={message.author} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-muted">{message.author.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground truncate">{message.author}</span>
                        <span className={cn(
                            "text-[10px] font-bold uppercase  px-1.5 py-0.5 rounded",
                            isTwitch ? "bg-purple-500/20 text-purple-400" : "bg-red-500/20 text-red-400"
                        )}>
                            {message.platform}
                        </span>
                        <span className="text-[10px] text-muted ml-auto">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-sm text-foreground break-words leading-relaxed">
                        {message.content}
                    </p>
                </div>
            </div>

            {/* Actions for Pending */}
            {message.status === 'PENDING' && (
                <div className="mt-4 flex gap-2 pt-3 border-t border-card-border">
                    <button
                        onClick={() => onApprove?.(message.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                        <Check size={14} /> Approve
                    </button>
                    <button
                        onClick={() => onReject?.(message.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                        <X size={14} /> Reject
                    </button>
                </div>
            )}

            {/* Actions for Approved */}
            {message.status === 'APPROVED' && (
                <div className="mt-4 flex gap-2 pt-3 border-t border-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onSendToAir?.(message.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-bold  transition-all"
                    >
                        <Tv size={14} /> Send to Graphics
                    </button>
                    <button
                        onClick={() => onReject?.(message.id)}
                        className="px-3 flex items-center justify-center bg-card-bg hover:bg-red-500/20 text-muted hover:text-red-400 py-1.5 rounded-lg border border-card-border transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};
