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
import { ScriptEditorToolbar } from './ScriptEditorToolbar';
import { ScriptEditorFooter } from './ScriptEditorFooter';
import { AiChatDrawer } from './AiChatDrawer';
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
        setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsAiLoading(true);

        try {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, ' ') || editor.getText();

            const systemContext = `ESTAS ASISTIENDO AL GUIONISTA EN VIVO. Contenido actual del guion: "${text}"\n\nAyúdalo a redactar, sugerir ideas o corregir errores. Responde el chat natural y cuando ofrezcas reescrituras hazlas listas para copiar.`;

            const token = useAuthStore.getState().token;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/ai/chat-stream`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ history: [...aiMessages, { role: 'user', content: userMsg }], context: systemContext }),
            });

            if (!response.ok) throw new Error('Failed to start stream');
            if (!response.body) throw new Error('No body in response');

            setAiMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                accumulatedContent += chunk;
                
                setAiMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: accumulatedContent }];
                    }
                    return prev;
                });
            }
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

    return (
        <div className="flex flex-col h-full bg-card-bg/80 backdrop-blur-2xl rounded-[2.5rem] border border-card-border overflow-hidden  relative">
            {/* Real-time Indicator Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 pointer-events-none" />

            {/* Premium Toolbar */}
            <ScriptEditorToolbar
                editor={editor}
                isAiChatOpen={isAiChatOpen}
                setIsAiChatOpen={setIsAiChatOpen}
                aiMessages={aiMessages}
                setAiMessages={setAiMessages}
                isAiLoading={isAiLoading}
            />

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
                <AiChatDrawer
                    isAiChatOpen={isAiChatOpen}
                    setIsAiChatOpen={setIsAiChatOpen}
                    aiMessages={aiMessages}
                    isAiLoading={isAiLoading}
                    aiBottomRef={aiBottomRef}
                    aiInput={aiInput}
                    setAiInput={setAiInput}
                    handleSendAi={handleSendAi}
                    editor={editor}
                />
            </div>

            {/* Tactical Status Footer */}
            <ScriptEditorFooter isSyncing={isSyncing} />

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
