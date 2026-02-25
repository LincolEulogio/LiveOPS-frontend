import React, { useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Layout, Play } from 'lucide-react';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { useParams } from 'next/navigation';
import { cn } from '@/shared/utils/cn';

export const TimelineTagView = (props: NodeViewProps) => {
    const params = useParams();
    const productionId = params.id as string;
    const { blocks, startBlock, isMutating } = useTimeline(productionId);
    const { blockId, blockTitle } = props.node.attrs;
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the real block ID if we only have the title (from input rule)
    const resolvedBlock = blocks.find(b =>
        (blockId && b.id === blockId) ||
        (!blockId && b.title.toLowerCase() === blockTitle?.toLowerCase())
    );

    const isActive = resolvedBlock?.status === 'ACTIVE';

    // Auto-scroll logic: Listen for block start events
    useEffect(() => {
        if (isActive && containerRef.current) {
            containerRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    const handleTrigger = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (resolvedBlock && !isMutating) {
            startBlock(resolvedBlock.id);
        }
    };

    return (
        <NodeViewWrapper className="inline-block mx-1 align-middle" ref={containerRef}>
            <button
                onClick={handleTrigger}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase  transition-all",
                    isActive
                        ? "bg-red-600 text-white border-red-500 scale-110 z-10"
                        : "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 ",
                    isMutating && "opacity-50 cursor-not-allowed"
                )}
                title={isActive ? "EN EL AIRE" : `Activar bloque: ${blockTitle || resolvedBlock?.title}`}
            >
                {isActive ? <Play size={10} fill="currentColor" className="animate-pulse" /> : <Layout size={10} />}
                <span className="truncate max-w-[120px]">{blockTitle || resolvedBlock?.title || 'BLOQUE'}</span>
                {isActive && <div className="ml-1 text-[8px] animate-pulse">LIVE</div>}
            </button>
        </NodeViewWrapper>
    );
};
