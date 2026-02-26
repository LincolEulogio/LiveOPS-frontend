import React from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, List,
    Heading1, Heading2, AlignLeft, Sparkles, Bot, Hash
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Editor } from '@tiptap/react';

const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled, title }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px]",
            isActive ? "bg-indigo-600 text-white" : "text-muted hover:bg-card-border hover:text-foreground"
        )}
        title={title}
    >
        <Icon size={18} />
    </button>
);

interface Props {
    editor: Editor | null;
    isAiChatOpen: boolean;
    setIsAiChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    aiMessages: any[];
    setAiMessages: React.Dispatch<React.SetStateAction<any[]>>;
    isAiLoading: boolean;
}

export const ScriptEditorToolbar = ({
    editor, isAiChatOpen, setIsAiChatOpen, aiMessages, setAiMessages, isAiLoading
}: Props) => {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 bg-white/5 border-b border-card-border/50 gap-4">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 px-1">
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor?.isActive('heading', { level: 1 })} icon={Heading1} title="Título 1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor?.isActive('heading', { level: 2 })} icon={Heading2} title="Título 2" />
                <div className="w-px h-6 bg-card-border/50 mx-2 shrink-0" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')} icon={Bold} title="Negrita" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')} icon={Italic} title="Cursiva" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={editor?.isActive('underline')} icon={UnderlineIcon} title="Subrayado" />
                <div className="w-px h-6 bg-card-border/50 mx-2 shrink-0" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList')} icon={List} title="Lista" />
                <ToolbarButton onClick={() => editor?.chain().focus().setParagraph().run()} isActive={editor?.isActive('paragraph')} icon={AlignLeft} title="Párrafo" />
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
    );
};
