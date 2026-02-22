'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScript } from '@/features/script/hooks/useScript';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { SceneTag } from '@/features/script/extensions/SceneTag';
import { ArrowLeft, Maximize2, Minimize2, Type, MoveVertical, Monitor, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';

export default function TeleprompterPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { doc, isLoaded } = useScript(id);

    // Prompter State
    const [fontSize, setFontSize] = useState(48);
    const [isMirrored, setIsMirrored] = useState(false);
    const [isAutoScroll, setIsAutoScroll] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(2);
    const scrollInterval = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        editable: false, // Prompter is read-only
        extensions: [
            StarterKit,
            SceneTag,
            Collaboration.configure({
                document: doc,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none pt-32 pb-[40vh] px-[10%]',
            },
        },
    }, [isLoaded]);

    // Remote scroll listener
    useEffect(() => {
        const handleRemoteScroll = (e: any) => {
            const { scrollPercentage } = e.detail;
            if (containerRef.current && !isAutoScroll) {
                const targetScroll = scrollPercentage * (containerRef.current.scrollHeight - containerRef.current.clientHeight);
                containerRef.current.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        };

        window.addEventListener('script.scroll_remote', handleRemoteScroll as EventListener);
        return () => window.removeEventListener('script.scroll_remote', handleRemoteScroll as EventListener);
    }, [isAutoScroll]);

    // Auto-scroll logic
    useEffect(() => {
        if (isAutoScroll) {
            scrollInterval.current = setInterval(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop += scrollSpeed;
                }
            }, 50);
        } else {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        }
        return () => {
            if (scrollInterval.current) clearInterval(scrollInterval.current);
        };
    }, [isAutoScroll, scrollSpeed]);

    if (!isLoaded) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-xl font-bold text-stone-500 uppercase tracking-[0.2em] animate-pulse">
                        Sincronizando Prompter...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
            {/* Minimalist Overlay Controls */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm border-b border-white/5 transition-opacity duration-500">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-widest text-white/90">Teleprompter</h1>
                        <p className="text-[10px] text-indigo-400 font-bold tracking-[0.3em] uppercase">Status: Live Sync</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1">
                        <button
                            onClick={() => setFontSize(prev => Math.max(24, prev - 4))}
                            className="p-2 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white"
                        >
                            <Type size={18} />
                        </button>
                        <span className="w-12 text-center text-xs font-mono font-bold text-indigo-400">{fontSize}px</span>
                        <button
                            onClick={() => setFontSize(prev => Math.min(120, prev + 4))}
                            className="p-2 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white"
                        >
                            <Type size={24} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsMirrored(!isMirrored)}
                        className={cn(
                            "p-3 rounded-xl transition-all border",
                            isMirrored
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
                        )}
                        title="Mirror Mode (Espejo)"
                    >
                        <Monitor size={20} />
                    </button>

                    <button
                        onClick={() => setIsAutoScroll(!isAutoScroll)}
                        className={cn(
                            "p-3 rounded-xl transition-all border",
                            isAutoScroll
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
                        )}
                        title="Auto-Scroll"
                    >
                        <MoveVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Prompter Content */}
            <div
                ref={containerRef}
                className={cn(
                    "flex-1 overflow-y-auto scroll-smooth hide-scrollbar transition-transform duration-700",
                    isMirrored && "scale-x-[-1]"
                )}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
            >
                {/* Center marker for the presenter */}
                <div className="fixed top-1/2 left-0 right-0 h-px bg-indigo-500/30 z-0 pointer-events-none">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-500 rounded-l-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                </div>

                <div className="max-w-4xl mx-auto font-bold tracking-tight px-10">
                    {editor?.isEmpty && (
                        <div className="text-stone-700 text-center py-20 uppercase tracking-[0.2em] text-2xl opacity-50">
                            Guion Vacío
                        </div>
                    )}
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .prose-invert {
                    --tw-prose-body: #ffffff;
                    --tw-prose-headings: #ffffff;
                }
                .prose-invert h1, .prose-invert h2, .prose-invert h3 {
                    color: #6366f1;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 1em;
                }
                .prose-invert p {
                    margin-bottom: 0.8em;
                }
            `}</style>
        </div>
    );
}
