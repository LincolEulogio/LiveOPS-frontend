import React from 'react';
import { Bot, Send, User } from 'lucide-react';

interface Props {
    messages: any[];
    isLoading: boolean;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    handleSend: () => void;
}

export const AiBriefingInterface = ({
    messages, isLoading, bottomRef, input, setInput, handleSend
}: Props) => {
    return (
        <>
            <div className="flex-1 overflow-y-auto min-h-0 my-4 pr-2 custom-scrollbar-premium flex flex-col gap-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-[16px] leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-background/40 border border-card-border text-foreground/90 rounded-tl-sm'}`}>
                            {m.content.split('\n').map((line: any, idx: number) => (
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
                    className="w-full bg-background/50 border border-card-border focus:border-indigo-500/40 rounded-2xl pl-4 pr-12 py-3.5 text-[12px] text-foreground placeholder:text-muted focus:outline-none transition-all"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all active:scale-95"
                >
                    <Send size={14} />
                </button>
            </div>
        </>
    );
};
