'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronDown, Activity } from 'lucide-react';
import { aiService } from '@/features/ai/api/ai.service';
import { apiClient } from '@/shared/api/api.client';
import { AiBriefingInterface } from './AiBriefingInterface';

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
        <div className="bg-card-bg/60 backdrop-blur-xl border border-card-border rounded-4xl p-6 flex flex-col h-[600px] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

            <div className="flex items-center justify-between border-b border-card-border/40 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Bot size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Livia Intelligence</h2>
                        <p className="text-[9px] text-muted font-bold uppercase">Briefing & Command v4.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Link</span>
                </div>
            </div>

            {/* AI Insights Bar */}
            <div className="grid grid-cols-3 gap-2 my-4 shrink-0">
                <div className="bg-indigo-500/3 border border-indigo-500/10 rounded-xl p-2.5">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Sentiment</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[78%]" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">78%</span>
                    </div>
                </div>
                <div className="bg-indigo-500/3 border border-indigo-500/10 rounded-xl p-2.5">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Engagement</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[45%]" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400">High</span>
                    </div>
                </div>
                <div className="bg-indigo-500/3 border border-indigo-500/10 rounded-xl p-2.5">
                    <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Tech Health</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[95%]" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500">95%</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
                {[
                    { label: 'Analizar Sentimiento', icon: '📊' },
                    { label: 'Resumen Escaleta', icon: '📝' },
                    { label: 'Estado Técnico', icon: '⚡' },
                    { label: 'Sugerir Clips', icon: '📽️' }
                ].map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => { setInput(action.label); handleSend(); }}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 text-[9px] font-bold text-indigo-300 transition-all uppercase tracking-wider"
                    >
                        {action.icon} {action.label}
                    </button>
                ))}
            </div>

            <AiBriefingInterface
                messages={messages}
                isLoading={isLoading}
                bottomRef={bottomRef}
                input={input}
                setInput={setInput}
                handleSend={handleSend}
            />
        </div>
    );
};
