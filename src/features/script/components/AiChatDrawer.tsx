import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Bot, User, Zap, MessageSquare } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface Props {
    isAiChatOpen: boolean;
    setIsAiChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    aiMessages: any[];
    isAiLoading: boolean;
    aiBottomRef: React.RefObject<HTMLDivElement | null>;
    aiInput: string;
    setAiInput: React.Dispatch<React.SetStateAction<string>>;
    handleSendAi: () => void;
    editor: Editor | null;
}

export const AiChatDrawer = ({
    isAiChatOpen, setIsAiChatOpen, aiMessages, isAiLoading, aiBottomRef,
    aiInput, setAiInput, handleSendAi, editor
}: Props) => {
    return (
        <AnimatePresence>
            {isAiChatOpen && (
                <motion.div
                    initial={{ x: 500, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 500, opacity: 0 }}
                    className="absolute right-4 top-4 bottom-4 w-[420px] bg-card-bg/98 backdrop-blur-3xl border border-indigo-500/40 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-4 border-b border-card-border/50 pb-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Sparkles size={16} />
                            <span className="text-xs font-black text-foreground uppercase tracking-widest">Livia Script Assistant</span>
                        </div>
                        <button onClick={() => setIsAiChatOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-muted">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar-premium pr-2 flex flex-col gap-4">
                        {aiMessages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    {m.role === 'assistant' ? <Bot size={10} /> : <User size={10} />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-[16px] leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-background/40 border border-card-border text-foreground/90 rounded-tl-sm'}`}>
                                    {m.content.split('\n').map((line: any, idx: number) => (
                                        <p key={idx} className={`${line.startsWith('**') ? 'font-black text-indigo-300 mt-2 mb-1' : 'mb-1 last:mb-0'}`}>
                                            {line.replace(/\*\*/g, '')}
                                        </p>
                                    ))}
                                    {m.role === 'assistant' && i === aiMessages.length - 1 && (
                                        <button
                                            onClick={() => editor?.chain().focus().insertContent(m.content).run()}
                                            className="mt-3 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 text-[9px] font-black uppercase rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 w-fit"
                                        >
                                            <Zap size={10} /> Insertar en Editor
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isAiLoading && (
                            <div className="flex gap-3">
                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                                    <Bot size={10} />
                                </div>
                                <div className="px-4 py-2 rounded-2xl rounded-tl-sm bg-background/40 border border-card-border text-indigo-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}
                        <div ref={aiBottomRef} />
                    </div>

                    <div className="mt-4 shrink-0 relative">
                        <input
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendAi();
                                }
                            }}
                            placeholder="Pregúntale a tu editor..."
                            className="w-full bg-background/50 border border-card-border focus:border-indigo-500/40 rounded-xl pl-4 pr-10 py-3 text-[16px] text-foreground placeholder:text-muted focus:outline-none transition-all"
                        />
                        <button
                            onClick={handleSendAi}
                            disabled={!aiInput.trim() || isAiLoading}
                            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[10px] transition-all"
                        >
                            <MessageSquare size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
