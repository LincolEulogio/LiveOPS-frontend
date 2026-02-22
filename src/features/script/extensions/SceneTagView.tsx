import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Video, Zap } from 'lucide-react';
import { useStreaming } from '@/features/streaming/hooks/useStreaming';
import { useParams } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

export const SceneTagView = (props: any) => {
    const params = useParams();
    const id = params.id as string;
    const { sendCommand, isPending } = useStreaming(id);
    const { sceneName } = props.node.attrs;

    const handleTrigger = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isPending) return;

        sendCommand({
            type: 'CHANGE_SCENE',
            sceneName: sceneName,
        });
    };

    return (
        <NodeViewWrapper className="inline-block mx-1 align-middle">
            <button
                onClick={handleTrigger}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                    "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 shadow-sm",
                    isPending && "opacity-50 cursor-not-allowed animate-pulse"
                )}
                title={`Cambiar a escena: ${sceneName}`}
            >
                <Video size={10} className="text-indigo-400" />
                <span className="truncate max-w-[100px]">{sceneName}</span>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
            </button>
        </NodeViewWrapper>
    );
};
