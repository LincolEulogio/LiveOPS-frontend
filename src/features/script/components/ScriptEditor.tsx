'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
    Bold, Italic, List, ListOrdered,
    Type, Save, Cloud, CloudOff, AlertCircle,
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

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
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
                class: 'prose prose-sm prose-invert focus:outline-none max-w-none min-h-[500px] px-8 py-10',
            },
        },
    }, [isLoaded]); // Re-initialize when doc is ready

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center bg-stone-950/50 rounded-2xl border border-stone-800/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-stone-500 uppercase tracking-widest animate-pulse">Cargando Guion Vivo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-stone-900/20 rounded-2xl border border-stone-800/50 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-stone-900/40 border-b border-stone-800/50">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-stone-800",
                            editor?.isActive('bold') ? "bg-indigo-600 text-white" : "text-stone-400"
                        )}
                        title="Negrita"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-stone-800",
                            editor?.isActive('italic') ? "bg-indigo-600 text-white" : "text-stone-400"
                        )}
                        title="Cursiva"
                    >
                        <Italic size={18} />
                    </button>
                    <div className="w-px h-6 bg-stone-800 mx-1" />
                    <button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-stone-800",
                            editor?.isActive('bulletList') ? "bg-indigo-600 text-white" : "text-stone-400"
                        )}
                        title="Lista de puntos"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={cn(
                            "p-2 rounded-lg transition-all hover:bg-stone-800",
                            editor?.isActive('orderedList') ? "bg-indigo-600 text-white" : "text-stone-400"
                        )}
                        title="Lista numerada"
                    >
                        <ListOrdered size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-4 px-4">
                    <div className="flex items-center gap-2">
                        {isSyncing ? (
                            <>
                                <Cloud size={14} className="text-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Sincronizando...</span>
                            </>
                        ) : (
                            <>
                                <Cloud size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-stone-500 uppercase tracking-tighter">
                                    {lastSyncTime ? `Sincronizado ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Sincronizado'}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="text-[10px] font-bold text-stone-600">
                        {editor?.storage.characterCount.characters() || 0} CARACTERES
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div
                className="flex-1 overflow-y-auto bg-stone-950/30 custom-scrollbar"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
                    syncScroll(percentage);
                }}
            >
                <EditorContent editor={editor} />
            </div>

            {/* Footer / Status */}
            <div className="p-3 bg-stone-900/40 border-t border-stone-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-stone-500" />
                    <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">
                        Cualquier cambio se guarda automáticamente para todo el equipo
                    </span>
                </div>
            </div>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #444;
                    pointer-events: none;
                    height: 0;
                }
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
