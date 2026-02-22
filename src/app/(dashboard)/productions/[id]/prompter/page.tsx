'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScript } from '@/features/script/hooks/useScript';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { SceneTag } from '@/features/script/extensions/SceneTag';
import { ArrowLeft, Monitor, Type, MoveVertical, Play } from 'lucide-react';
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
        <div className="relative flex flex-col h-[calc(100vh-8rem)] bg-stone-950 text-white overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl font-sans selection:bg-indigo-500/30">
            {/* Integrated Header - No Overlap */}
            <header className="flex-none h-24 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-xl z-[50]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-stone-900 hover:bg-stone-800 rounded-xl text-white transition-all border border-white/5 group active:scale-95"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col">
                        <h1 className="text-xl font-black uppercase tracking-widest text-white/90 antialiased">Teleprompter</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <p className="text-[9px] text-emerald-500/80 font-bold tracking-[0.3em] uppercase">Engine Synchronized</p>
                        </div>
                    </div>
                </div>

                {/* Control Center - Embedded Style */}
                <div className="flex items-center gap-3 bg-stone-900/50 p-1.5 rounded-2xl border border-white/5">
                    {/* Scale Group */}
                    <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => setFontSize(prev => Math.max(24, prev - 8))}
                            className="p-2.5 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-all active:scale-90"
                        >
                            <Type size={14} />
                        </button>
                        <div className="w-14 text-center flex flex-col">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">Scale</span>
                            <span className="text-sm font-black font-mono leading-none">{fontSize}</span>
                        </div>
                        <button
                            onClick={() => setFontSize(prev => Math.min(160, prev + 8))}
                            className="p-2.5 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-all active:scale-90"
                        >
                            <Type size={24} />
                        </button>
                    </div>

                    {/* Speed Group */}
                    <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                        <button
                            onClick={() => setScrollSpeed(prev => Math.max(1, prev - 1))}
                            className="p-2.5 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-all active:scale-90"
                        >
                            <MoveVertical size={12} />
                        </button>
                        <div className="w-14 text-center flex flex-col">
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter mb-0.5">Speed</span>
                            <span className="text-sm font-black font-mono leading-none">x{scrollSpeed}</span>
                        </div>
                        <button
                            onClick={() => setScrollSpeed(prev => Math.min(10, prev + 1))}
                            className="p-2.5 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-all active:scale-90"
                        >
                            <MoveVertical size={20} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-1" />

                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setIsMirrored(!isMirrored)}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 border",
                                isMirrored
                                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                                    : "bg-stone-800 border-white/5 text-stone-500 hover:text-white"
                            )}
                        >
                            <Monitor size={18} />
                            <span className="text-[8px] font-black uppercase mt-1">Mirror</span>
                        </button>

                        <button
                            onClick={() => setIsAutoScroll(!isAutoScroll)}
                            className={cn(
                                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 border",
                                isAutoScroll
                                    ? "bg-emerald-600 border-emerald-400 text-white shadow-lg"
                                    : "bg-stone-800 border-white/5 text-stone-500 hover:text-white"
                            )}
                        >
                            <Play size={18} className={cn(isAutoScroll && "animate-pulse")} />
                            <span className="text-[8px] font-black uppercase mt-1">{isAutoScroll ? 'STOP' : 'AUTO'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Scroll Controlled */}
            <main
                ref={containerRef}
                className={cn(
                    "flex-1 overflow-y-auto scroll-smooth hide-scrollbar transition-transform duration-1000 ease-in-out relative",
                    isMirrored && "scale-x-[-1]"
                )}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.2' }}
            >
                {/* Embedded Reading Zone Marker */}
                <div className="sticky top-1/2 left-0 right-0 h-40 -translate-y-1/2 z-0 pointer-events-none">
                    <div className="absolute inset-x-0 inset-y-0 bg-white/[0.01] border-y border-white/5" />

                    {/* Lateral Indicators */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 shadow-[10px_0_30px_rgba(99,102,241,0.2)]" />
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-indigo-500 shadow-[-10px_0_30px_rgba(99,102,241,0.2)]" />

                    {/* Brackets */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-20 border-l-4 border-y-4 border-indigo-500/20 rounded-l-2xl" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-20 border-r-4 border-y-4 border-indigo-500/20 rounded-r-2xl" />
                </div>

                <div className="max-w-[120rem] mx-auto font-black tracking-tight px-10 pt-[40vh] pb-[60vh]">
                    {editor?.isEmpty && (
                        <div className="flex flex-col items-center justify-center py-40 opacity-20">
                            <Monitor size={64} className="text-stone-500 mb-6" />
                            <h2 className="text-4xl text-stone-500 uppercase tracking-[0.3em] font-black text-center">
                                No Script
                            </h2>
                        </div>
                    )}
                    <EditorContent editor={editor} />
                </div>
            </main>

            {/* Subtle Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Global Styles refined for embedded view */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .prose-invert {
                    --tw-prose-body: #ffffff;
                }
                
                .prose-invert [data-type="scene-tag"] {
                    display: inline-block;
                    background: #6366f1;
                    color: white;
                    padding: 0.1rem 0.6rem;
                    margin: 1.5rem 0;
                    border-radius: 0.5rem;
                    font-size: 0.4em;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-weight: 900;
                    box-shadow: 0 10px 30px rgba(99,102,241,0.4);
                }

                .prose-invert h1, .prose-invert h2 {
                    color: #818cf8;
                    font-size: 0.7em;
                    border-bottom: 4px solid #818cf8;
                    display: inline-block;
                    padding-bottom: 0.1rem;
                    margin: 3rem 0 1.5rem 0;
                    text-transform: uppercase;
                }

                .prose-invert p {
                    margin-bottom: 1.25rem;
                    font-weight: 900;
                }
            `}</style>
        </div>
    );
}
