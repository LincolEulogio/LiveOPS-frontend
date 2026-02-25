import React, { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeviceAlertViewProps {
    activeAlert: any;
    activeRole: string;
    onAcknowledge: (alertId: string, response: string) => void;
}

export const DeviceAlertView: React.FC<DeviceAlertViewProps> = ({
    activeAlert,
    activeRole,
    onAcknowledge
}) => {
    const [alertReply, setAlertReply] = useState('');

    const handleReply = () => {
        if (alertReply.trim()) {
            onAcknowledge(activeAlert.id, `Mensaje: ${alertReply.trim()}`);
            setAlertReply('');
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeAlert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
                style={{ backgroundColor: activeAlert.color || '#3b82f6' }}
            >
                {/* Background Pattern for urgency */}
                {activeAlert.message.toLowerCase().includes('aire') && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
                    />
                )}

                <div className="w-full flex justify-between items-start z-10">
                    <div className="bg-background/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-foreground/10">
                        <p className="text-[9px] text-muted uppercase font-black  leading-none mb-1">Coordinación</p>
                        <p className="text-xs font-black text-foreground uppercase ">{activeAlert.senderName}</p>
                    </div>
                    <div className="bg-background/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-foreground/10 text-right">
                        <p className="text-[9px] text-muted uppercase font-black  leading-none mb-1">Tu Rol</p>
                        <p className="text-xs font-black text-foreground uppercase ">{activeRole}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full px-4 text-white">
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 12 }}
                    >
                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase er leading-[0.85] ">
                            {activeAlert.message}
                        </h1>
                    </motion.div>
                </div>

                <div className="w-full max-w-sm grid grid-cols-2 gap-3 z-10">
                    <button
                        onClick={() => onAcknowledge(activeAlert.id, 'Confirmado')}
                        className="col-span-2 flex items-center justify-center gap-3 bg-white text-black py-6 rounded-[2.5rem] font-black uppercase  active:scale-95 transition-all  text-lg"
                    >
                        <CheckCircle size={28} />
                        CONFIRMADO
                    </button>

                    <button
                        onClick={() => onAcknowledge(activeAlert.id, 'Problema')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-md border border-white/20 text-white py-5 rounded-[2rem] font-bold uppercase  active:scale-95 transition-all text-[10px]"
                    >
                        PROBLEMA
                    </button>

                    <button
                        onClick={() => onAcknowledge(activeAlert.id, 'No me ponches')}
                        className="flex flex-col items-center justify-center gap-1 bg-red-600/40 backdrop-blur-md text-white border border-red-500/30 py-5 rounded-[2rem] font-bold uppercase  active:scale-95 transition-all text-[10px]"
                    >
                        PONCHE NO
                    </button>

                    <button
                        onClick={() => onAcknowledge(activeAlert.id, 'Check')}
                        className="flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-md border border-white/20 text-white py-4 rounded-[1.5rem] font-bold uppercase  active:scale-95 transition-all text-[10px]"
                    >
                        CHECK
                    </button>

                    <button
                        onClick={() => onAcknowledge(activeAlert.id, 'Listo')}
                        className="flex flex-col items-center justify-center gap-1 bg-green-600/40 backdrop-blur-md text-white border border-green-500/30 py-4 rounded-[1.5rem] font-bold uppercase  active:scale-95 transition-all text-[10px]"
                    >
                        LISTO
                    </button>

                    {/* Chat Response Input */}
                    <div className="col-span-2 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-2 flex items-center gap-2 transition-all focus-within:bg-white/20 focus-within:border-white/40">
                        <input
                            type="text"
                            value={alertReply}
                            onChange={(e) => setAlertReply(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleReply();
                                }
                            }}
                            placeholder="Respuesta rápida..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-white focus:outline-none placeholder:text-white/40 font-bold"
                        />
                        <button
                            onClick={handleReply}
                            disabled={!alertReply.trim()}
                            className="bg-white text-black p-3 rounded-2xl transition-colors active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
