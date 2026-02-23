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
import { SceneTag } from '../extensions/SceneTag';
import { TimelineTag } from '../extensions/TimelineTag';
import { useScript } from '../hooks/useScript';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    Type, Save, Cloud, CloudOff, AlertCircle,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    Zap
} from 'lucide-react';
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
                provider: { awareness } as unknown as { awareness: awarenessProtocol.Awareness }, // Using correct type from y-protocols
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
                    color: '#6366f1', // We can make this dynamic based on user ID
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm focus:outline-none max-w-none px-8 py-10 prose-p:my-1 prose-headings:my-2 prose-h1:text-3xl prose-h2:text-2xl cursor-text',
            },
        },
        onSelectionUpdate: () => {
            setTick(t => t + 1);
        },
        onUpdate: () => {
            setTick(t => t + 1);
        },
    }, [isLoaded]); // Re-initialize when doc is ready

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center bg-card-bg/50 rounded-2xl border border-card-border/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted uppercase tracking-widest animate-pulse">Cargando Guion Vivo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card-bg rounded-2xl border border-card-border overflow-hidden shadow-md">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-card-bg border-b border-card-border">
                <div className="flex items-center gap-1 flex-wrap">
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 1 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 1"
                    >
                        <Heading1 size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 2 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 2"
                    >
                        <Heading2 size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 3 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 3"
                    >
                        <Heading3 size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 4 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 4"
                    >
                        <Heading4 size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 5 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 5"
                    >
                        <Heading5 size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('heading', { level: 6 }) ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Título 6"
                    >
                        <Heading6 size={18} />
                    </button>

                    <div className="w-px h-6 bg-card-border mx-1" />

                    <button
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('bold') ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Negrita"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('italic') ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Cursiva"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('underline') ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Subrayado"
                    >
                        <UnderlineIcon size={18} />
                    </button>

                    <div className="w-px h-6 bg-card-border mx-1" />

                    <button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('bulletList') ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Lista de puntos"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        disabled={editor?.state.selection.empty}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-card-border disabled:opacity-30 disabled:hover:bg-transparent",
                            editor?.isActive('orderedList') ? "bg-indigo-600 text-white" : "text-muted"
                        )}
                        title="Lista numerada"
                    >
                        <ListOrdered size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4 px-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                            {editor?.storage.characterCount.characters() || 0}
                        </span>
                        <span className="text-[8px] font-black text-muted/60 uppercase tracking-tighter">CARACTERES</span>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div
                className="flex-1 overflow-y-auto bg-background custom-scrollbar cursor-text relative min-h-0"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
                    syncScroll(percentage);
                }}
            >
                <div className="max-w-4xl mx-auto min-h-full pb-20">
                    <EditorContent
                        editor={editor}
                        className="cursor-text"
                    />
                </div>
            </div>

            {/* Footer / Status */}
            <div className="p-3 bg-card-bg border-t border-card-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-muted" />
                    <span className="text-[9px] text-muted font-bold uppercase tracking-widest">
                        Cualquier cambio se guarda automáticamente para todo el equipo
                    </span>
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror {
                    cursor: text !important;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: var(--muted);
                    opacity: 0.5;
                    pointer-events: none;
                    height: 0;
                    cursor: text;
                }
                .ProseMirror ul {
                    list-style-type: disc !important;
                    padding-left: 1.5em !important;
                    margin: 1em 0 !important;
                }
                .ProseMirror ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5em !important;
                    margin: 1em 0 !important;
                }
                .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.25em; margin-bottom: 0.5em; }
                .ProseMirror h4 { font-size: 1.125rem; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
                .ProseMirror h5 { font-size: 1rem; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
                .ProseMirror h6 { font-size: 0.875rem; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
                
                .collaboration-cursor__caret {
                    position: relative;
                    margin-left: -1px;
                    margin-right: -1px;
                    border-left: 2px solid #0d0d0d;
                    border-right: 2px solid #0d0d0d;
                    word-break: normal;
                    pointer-events: none;
                }
                .collaboration-cursor__label {
                    position: absolute;
                    top: -1.25em;
                    left: -1px;
                    font-size: 10px;
                    font-style: normal;
                    font-weight: 900;
                    line-height: normal;
                    user-select: none;
                    color: white;
                    padding: 2px 6px;
                    white-space: nowrap;
                    border-radius: 4px 4px 4px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
};
