'use client';
import React from 'react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import * as awarenessProtocol from 'y-protocols/awareness';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { SceneTag } from '@/features/script/extensions/SceneTag';
import { TimelineTag } from '@/features/script/extensions/TimelineTag';
import { useScript } from '@/features/script/hooks/useScript';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    Type, Save, Cloud, CloudOff, AlertCircle,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    Zap, Hash, AlignLeft, Sparkles, MessageSquare, Bot, X, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/features/ai/api/ai.service';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';

interface Props {
    productionId: string;
}

interface CaretUser {
    name?: string;
    color?: string;
}

export const ScriptEditor = ({ productionId }: Props) => {
    const { doc, awareness, isLoaded, syncScroll, isSyncing, lastSyncTime } = useScript(productionId);
    const user = useAuthStore((state) => state.user);
    const [, setTick] = React.useState(0);
    const [isAiChatOpen, setIsAiChatOpen] = React.useState(false);
    const [aiMessages, setAiMessages] = React.useState<any[]>([]);
    const [aiInput, setAiInput] = React.useState('');
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const aiBottomRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);

    const handleSendAi = async () => {
        if (!editor || !aiInput.trim() || isAiLoading) return;

        const userMsg = aiInput.trim();
        setAiInput('');
        const newMsgs = [...aiMessages, { role: 'user', content: userMsg }];
        setAiMessages(newMsgs);
        setIsAiLoading(true);

        try {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, ' ') || editor.getText();

            const systemContext = `ESTAS ASISTIENDO AL GUIONISTA EN VIVO. 
            Contenido actual del guion: "${text}"
            
            Ayúdalo a redactar, sugerir ideas o corregir errores. Responde el chat natural y cuando ofrezcas reescrituras hazlas listas para copiar.`;

            const res = await aiService.chat(newMsgs, systemContext);
            setAiMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
        } catch (error) {
            console.error('AI Chat failed:', error);
            setAiMessages(prev => [...prev, { role: 'assistant', content: "ALERT: Failed to reach creative intelligence nodes." }]);
        } finally {
            setIsAiLoading(false);
        }
    };


    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder: 'Escribe el guion de la producción aquí... Usa [ESCENA:Nombre] u [BLOCK:Nombre] para crear disparadores.',
            }),
            CharacterCount,
            SceneTag,
            TimelineTag,
            Collaboration.configure({
                document: doc,
            }),
            CollaborationCaret.configure({
                provider: { awareness } as unknown as { awareness: awarenessProtocol.Awareness },
                render: (user: CaretUser) => {
                    const cursor = document.createElement('span');
                    cursor.classList.add('collaboration-cursor__caret');
                    cursor.style.borderLeftColor = user.color || '#6366f1';

                    const label = document.createElement('div');
                    label.classList.add('collaboration-cursor__label');
                    label.setAttribute('style', `background-color: ${user.color || '#6366f1'}`);
                    label.insertBefore(document.createTextNode(user.name || 'User'), null);
                    cursor.insertBefore(label, null);

                    return cursor;
                },
                user: {
                    name: user?.name || 'Anon',
                    color: '#6366f1',
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none px-6 sm:px-12 py-10 sm:py-16 prose-p:my-1 prose-headings:my-2 prose-h1:text-4xl prose-h1:font-black prose-h2:text-3xl prose-h2:font-black cursor-text min-h-full font-serif',
            },
        },
        onSelectionUpdate: () => {
            setTick(t => t + 1);
        },
        onUpdate: () => {
            setTick(t => t + 1);
        },
    }, [isLoaded]);

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center bg-card-bg/50 rounded-3xl backdrop-blur-xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-foreground uppercase  mb-1">Live Scripting</p>
                        <p className="text-[10px] font-bold text-muted uppercase  animate-pulse">Syncing with Cloud Doc...</p>
                    </div>
                </div>
            </div>
        );
    }

    const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled, title }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px]",
                isActive ? "bg-indigo-600 text-white  " : "text-muted hover:bg-card-border hover:text-foreground"
            )}
            title={title}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-card-bg/80 backdrop-blur-2xl rounded-[2.5rem] border border-card-border overflow-hidden  relative">
            {/* Real-time Indicator Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 pointer-events-none" />

            {/* Premium Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 bg-white/5 border-b border-card-border/50 gap-4">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 px-1">
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor?.isActive('heading', { level: 1 })}
                        icon={Heading1}
                        title="Título 1"
                    />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor?.isActive('heading', { level: 2 })}
                        icon={Heading2}
                        title="Título 2"
                    />
                    <div className="w-px h-6 bg-card-border/50 mx-2 shrink-0" />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        isActive={editor?.isActive('bold')}
                        icon={Bold}
                        title="Negrita"
                    />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        isActive={editor?.isActive('italic')}
                        icon={Italic}
                        title="Cursiva"
                    />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        isActive={editor?.isActive('underline')}
                        icon={UnderlineIcon}
                        title="Subrayado"
                    />
                    <div className="w-px h-6 bg-card-border/50 mx-2 shrink-0" />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        isActive={editor?.isActive('bulletList')}
                        icon={List}
                        title="Lista"
                    />
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().setParagraph().run()}
                        isActive={editor?.isActive('paragraph')}
                        icon={AlignLeft}
                        title="Párrafo"
                    />
                    <div className="w-px h-6 bg-card-border/50 mx-2 shrink-0" />
                    <button
                        onClick={() => {
                            if (!isAiChatOpen && aiMessages.length === 0) {
                                setAiMessages([{ role: 'assistant', content: '¡Hola! Soy tu asistente de guion de LIVIA. ¿En qué te ayudo con la redacción hoy?' }]);
                            }
                            setIsAiChatOpen(v => !v);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase active:scale-95",
                            isAiChatOpen && "bg-indigo-600 text-white"
                        )}
                    >
                        {isAiLoading ? <Bot size={14} className="animate-bounce" /> : <Sparkles size={14} />}
                        AI Assistant
                    </button>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-card-bg bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">
                                    {i === 1 ? 'JD' : 'AM'}
                                </div>
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-muted uppercase ">Editing Live</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 border border-card-border rounded-xl">
                        <Hash size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-black font-mono text-foreground leading-none">
                            {editor?.storage.characterCount.characters() || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Editor Surface */}
            <div
                className="flex-1 overflow-y-auto bg-background/30 custom-scrollbar-premium cursor-text relative"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
                    syncScroll(percentage);
                }}
            >
                <div className="max-w-4xl mx-auto min-h-full">
                    <EditorContent
                        editor={editor}
                        className="cursor-text"
                    />
                </div>

                {/* AI Suggestion Overlay Chat */}
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
                                <button
                                    onClick={() => setIsAiChatOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-muted"
                                >
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
            </div>

            {/* Tactical Status Footer */}
            <div className="p-3 bg-white/5 border-t border-card-border/50 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse " />
                    <span className="text-[9px] text-muted font-black uppercase ">
                        Live Sync: {isSyncing ? 'Pushing Changes...' : 'Synchronized'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Cloud size={12} className="text-muted" />
                    <span className="text-[9px] text-muted/60 font-black uppercase ">
                        v1.4.2-STABLE
                    </span>
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror {
                    cursor: text !important;
                    outline: none !important;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: var(--muted);
                    opacity: 0.3;
                    pointer-events: none;
                    height: 0;
                    font-weight: 300;
                }
                .ProseMirror ul {
                    list-style-type: none !important;
                    padding-left: 2rem !important;
                    position: relative;
                }
                .ProseMirror ul li::before {
                    content: '•';
                    position: absolute;
                    left: 0.75rem;
                    color: #6366f1;
                    font-weight: 900;
                }
                .ProseMirror h1 { line-height: 1; margin-bottom: 1.5rem; letter-spacing: -0.05em; color: #fff; }
                .ProseMirror h2 { line-height: 1; margin-bottom: 1.25rem; letter-spacing: -0.03em; color: rgba(255,255,255,0.9); }
                
                .collaboration-cursor__caret {
                    position: relative;
                    margin-left: -1px;
                    margin-right: -1px;
                    border-left: 2px solid #6366f1;
                    word-break: normal;
                    pointer-events: none;
                }
                .collaboration-cursor__label {
                    position: absolute;
                    top: -1.5rem;
                    left: 0;
                    font-size: 9px;
                    font-weight: 900;
                    color: white;
                    padding: 2px 8px;
                    white-space: nowrap;
                    border-radius: 6px 6px 6px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .custom-scrollbar-premium::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar-premium::-webkit-scrollbar-track { bg-transparent; }
                .custom-scrollbar-premium::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar-premium:hover::-webkit-scrollbar-thumb {
                    background: rgba(99,102,241,0.2);
                }

                /* AI Suggestion Insertion Styles */
                .ai-suggestion-block {
                    background: rgba(99, 102, 241, 0.05);
                    border-left: 4px solid #6366f1;
                    padding: 1.5rem 2rem;
                    margin: 2rem 0;
                    border-radius: 0 1.5rem 1.5rem 0;
                    cursor: default;
                }
                .ai-header {
                    font-family: sans-serif !important;
                    font-size: 11px !important;
                    font-weight: 900 !important;
                    color: #6366f1 !important;
                    letter-spacing: 0.1em;
                    margin-bottom: 1rem !important;
                }
                .ai-content {
                    font-family: sans-serif !important;
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-weight: 400 !important;
                }
                .ai-content p {
                    margin-bottom: 0.75rem !important;
                }
                .ai-content strong {
                    color: #fff !important;
                    font-weight: 700 !important;
                }
            `}</style>
        </div>
    );
};
