'use client';

import React, { useState } from 'react';
import { Sparkles, X, Wand2, ArrowRight, Zap, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/shared/api/api.client';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

interface AiMacroBuilderProps {
    productionId: string;
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export const AiMacroBuilder: React.FC<AiMacroBuilderProps> = ({ productionId, isOpen, onClose, onCreated }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [preview, setPreview] = useState<any>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;
        setIsGenerating(true);
        try {
            const result = await apiClient.post(`/productions/${productionId}/automation/ai-generate`, { prompt });
            setPreview(result);
            toast.success('Protocolo IA generado con éxito ⚡');
        } catch (e) {
            toast.error('Génesis fallido. Reintente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirm = () => {
        onCreated();
        onClose();
        setPreview(null);
        setPrompt('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-card-bg/90 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/10 rounded-4xl flex items-center justify-center border border-indigo-500/20 ">
                                <Sparkles className="text-indigo-400 group-hover:animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1">Macro Architect [AI]</h2>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                    Neural Network Interface
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-full text-muted transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 flex-1">
                        {!preview ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                        <Info size={12} className="text-indigo-500" />
                                        Comando de Lenguaje Natural
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Ej: 'Cuando se caigan los frames en OBS, corta a la escena de reserva de vMix y envíame un mensaje de intercom...'"
                                        className="w-full h-32 bg-background/50 border border-white/10 rounded-4xl p-6 text-xs font-bold text-foreground placeholder:text-muted/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none italic"
                                    />
                                </div>
                                
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isGenerating}
                                    className={cn(
                                        "w-full py-5 rounded-4xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all",
                                        isGenerating 
                                            ? "bg-indigo-600/50 cursor-wait text-white/50" 
                                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 active:scale-95"
                                    )}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Sintetizando Lógica...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={16} />
                                            Generar Macro Técnica
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-white/2 border border-white/10 rounded-3xl space-y-4">
                                    <div>
                                        <h3 className="text-md font-black text-indigo-400 uppercase tracking-tighter mb-1">{preview.name}</h3>
                                        <p className="text-[11px] font-medium text-muted/80 italic">"{preview.description}"</p>
                                    </div>

                                    <div className="flex items-center gap-4 py-4 px-2">
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[8px] font-black text-muted uppercase">Trigger</span>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] font-black text-amber-500 flex items-center gap-2">
                                                <Activity size={12} />
                                                {preview.triggers[0]?.eventType.toUpperCase()}
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-muted mt-4" />
                                        <div className="flex-1 space-y-1">
                                            <span className="text-[8px] font-black text-muted uppercase">Result</span>
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-[10px] font-black text-indigo-400 flex items-center gap-2">
                                                <Zap size={12} />
                                                {preview.actions.length} COMMANDS
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setPreview(null)}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-muted transition-all"
                                    >
                                        Re-Sintetizar
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                    >
                                        Inyectar Protocolo
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
