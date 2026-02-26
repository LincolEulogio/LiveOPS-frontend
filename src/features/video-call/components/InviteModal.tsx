import React, { useState } from 'react';
import { Users, X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function InviteModal({ roomId, onClose }: { roomId: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const link = typeof window !== 'undefined' ? `${window.location.origin}/call/${roomId}` : '';
    const copy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Link copiado al portapapeles', { position: 'bottom-center' });
        setTimeout(() => setCopied(false), 2500);
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0d0e1c] border border-violet-500/15 rounded-3xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/8 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <X size={14} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                        <Users size={16} className="text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Invitar a otros</h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Cualquiera con este enlace puede unirse</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-black/50 border border-violet-500/20 rounded-xl mb-4">
                    <div className="flex-1 overflow-hidden px-3 text-[11px] text-white/60 font-mono truncate select-all">{link}</div>
                    <button onClick={copy} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-[10px] font-black uppercase tracking-wider transition-colors shrink-0">
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copied ? 'Copiado' : 'Copiar'}
                    </button>
                </div>

                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest border-t border-white/5 pt-4 mt-2">
                    Asegúrate de compartirlo solo con personas autorizadas.
                </p>
            </div>
        </div>
    );
}
