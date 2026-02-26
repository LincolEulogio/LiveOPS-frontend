'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronDown, Activity } from 'lucide-react';
import { aiService } from '@/features/ai/api/ai.service';
import { apiClient } from '@/shared/api/api.client';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AiBriefing = ({ productionId }: { productionId: string }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'LIVIA Intelligence System en línea. Monitoreando parámetros de la producción. ¿Qué necesitas saber?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Gather real-time context
            const [social, telemetry] = await Promise.all([
                apiClient.get<any[]>(`/productions/${productionId}/social/messages`).catch(() => []),
                apiClient.get<any[]>(`/productions/${productionId}/analytics/telemetry?minutes=15`).catch(() => []),
            ]);

            const socialText = social.length > 0
                ? social.slice(0, 10).map((m: any) => `${m.author}: ${m.content} (${m.aiSentiment || 'N/A'})`).join('\n')
                : "No active social engagement detected.";

            const latestTelemetry = telemetry[telemetry.length - 1];
            const telemetryText = latestTelemetry
                ? `FPS: ${latestTelemetry.fps || '60'}, CPU: ${latestTelemetry.cpuUsage || '15'}%, Dropped: ${latestTelemetry.droppedFrames || 0}`
                : "Telemetry node offline.";

            const systemContext = `
ERES LIVIA, IA DE DIRECCIÓN Y CONTROL DE LIVEOPS.
TIENES CONOCIMIENTO TOTAL DE TODA LA APLICACIÓN.

== SISTEMAS DISPONIBLES EN LIVEOPS (TU CONOCIMIENTO) ==
1. Operational Hub: Panel central de control técnico y telemetría de transmisión.
2. Escaleta / Rundown (ScriptEditor): Editor de guiones colaborativo en tiempo real.
3. Media Library: Gestor de recursos y Assets multimedia locales/nube.
4. Video Calls (Guest Room): Salas de videollamada WebRTC integradas de baja latencia. Interactor directo con invitados.
5. Multi-Cast Distribución: Control de retransmisión a YouTube, FB, Twitch, etc.
6. Graphics Engine: Controlador de Overlays, cintillos y gráficos pre-construidos en OBS/vMix.
7. Automation Macros: Combinación de secuencias ejecutables con 1-clic.
8. Hardware Manager: Mapeo de superficies físicas de control (MIDI / Elgato StreamDeck, AKAI).
9. Chat Social: Agregadores de chat de múltiples plataformas.

== ESTADO TÉCNICO EN VIVO ==
- Redes Sociales:
${socialText}

- Telemetría Engine:
${telemetryText}

== REGLAS ==
Eres experta funcional en todos los flujos de la app, responde naturalmente ofreciendo ayuda sobre cómo usar o qué datos observar en cualquiera de los módulos. No digas "no tengo conocimiento" o "solo verifico redes", tú eres la administradora digital completa.
`;
            const currentHistory = [...messages, { role: 'user' as const, content: userMsg }];
            const res = await aiService.chat(currentHistory, systemContext);

            setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
        } catch (error) {
            console.error('LIVIA chat failed:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "ALERT: Technical synchronization node unreachable. Check engine status." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-[2rem] p-6 flex flex-col h-[600px] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

            <div className="flex items-center justify-between border-b border-card-border/40 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Bot size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Livia AI Briefing</h2>
                        <p className="text-[9px] text-muted font-bold uppercase">Real-time Production Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <Activity size={10} className="text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 my-4 pr-2 custom-scrollbar-premium flex flex-col gap-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-[16px] leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-background/40 border border-card-border text-foreground/90 rounded-tl-sm'}`}>
                            {m.content.split('\n').map((line, idx) => (
                                <p key={idx} className={`${line.startsWith('**') ? 'font-black text-indigo-300 mt-2 mb-1' : 'mb-1 last:mb-0'}`}>
                                    {line.replace(/\*\*/g, '')}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Bot size={12} />
                        </div>
                        <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-background/40 border border-card-border text-indigo-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                            <span className="text-[10px] font-black uppercase tracking-widest ml-1">Livia está analizando...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="shrink-0 relative">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Escribe un mensaje a LIVIA..."
                    className="w-full bg-background/50 border border-card-border focus:border-indigo-500/40 rounded-2xl pl-4 pr-12 py-3.5 text-[16px] text-foreground placeholder:text-muted focus:outline-none transition-all"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all active:scale-95"
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    );
};
