'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { TimelineTag } from '../extensions/TimelineTag';
import { useScript } from '../hooks/useScript';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Rewind, Maximize, Minimize, ArrowLeft, Plus, Minus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import * as Y from 'yjs';
import Link from 'next/link';

interface Props {
    productionId: string;
}

export const PrompterView = ({ productionId }: Props) => {
    const { doc, awareness } = useScript(productionId);

    // Size persistence
    const [fontSize, setFontSize] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('prompter_font_size');
            return saved ? parseInt(saved, 10) : 72;
        }
        return 72;
    });

    useEffect(() => {
        localStorage.setItem('prompter_font_size', fontSize.toString());
    }, [fontSize]);

    const [scrollSpeed, setScrollSpeed] = useState(0); // pixels per frame
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const scrollPosRef = useRef(0); // High-precision scroll position

    // Sync ref when mounting or when manual scrolling occurs
    const handleScroll = () => {
        if (containerRef.current && !isPlaying) {
            scrollPosRef.current = containerRef.current.scrollTop;
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            TimelineTag,
            Collaboration.configure({
                document: doc,
            }),
        ],
        editable: false, // Prompter is purely read-only
        immediatelyRender: false, // Fix for SSR hydration
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-p:my-8 prose-headings:my-12 prose-h1:text-[1.5em] prose-h2:text-[1.3em] max-w-none focus:outline-none',
            },
        },
    }, [awareness, doc]);

    useEffect(() => {
        if (!doc || !editor) return;
        const state = doc.get('default', Y.XmlFragment);
        // Relying on Collaboration extension to auto-sync instead of manual setContent
    }, [doc, editor]);

    // Auto-scroll loop
    const animate = () => {
        if (isPlaying && scrollSpeed > 0 && containerRef.current) {
            scrollPosRef.current += scrollSpeed;
            containerRef.current.scrollTop = scrollPosRef.current;
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        // Sync the ref with actual position when starting playback
        if (isPlaying && containerRef.current) {
            scrollPosRef.current = containerRef.current.scrollTop;
        }
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [isPlaying, scrollSpeed]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    if (!editor) {
        return <div className="h-screen bg-black flex items-center justify-center text-stone-500 font-mono text-xl">CONNECTING SCRIPT...</div>;
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[calc(100vh-140px)] bg-stone-950 text-white overflow-y-auto overflow-x-hidden relative rounded-3xl border border-stone-800 shadow-2xl transition-all"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }}
        >
            {/* Header / Back Link */}
            <div className="sticky top-0 left-0 right-0 p-4 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800 flex items-center justify-between">
                <Link
                    href={`/productions/${productionId}`}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Prompter Mode</span>
                </div>
            </div>

            {/* Scroll Indication Line (Eye Level) */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-red-600/30 z-0 pointer-events-none" />
            <div className="absolute top-1/2 left-4 -mt-3 w-0 h-0 border-t-[12px] border-t-transparent border-l-[16px] border-l-red-600 border-b-[12px] border-b-transparent z-10 opacity-50" />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-16 pt-[33vh] pb-[66vh] relative z-10 w-full font-sans font-bold tracking-wide">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .prompter-content p { margin-bottom: 1em; opacity: 0.9; }
                    .prompter-content h1, .prompter-content h2, .prompter-content h3 { color: #facc15; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5em; margin-bottom: 0.5em; opacity: 1; }
                    .prompter-content [data-type="timelineBlock"] { display: inline-block; padding: 0.2em 0.5em; background: #dc2626; color: white; border-radius: 0.2em; text-transform: uppercase; font-size: 0.8em; margin: 1em 0; border: 4px solid #991b1b; }
                    .prompter-content strong { color: #60a5fa; }
                    .prompter-content em { color: #34d399; font-style: normal; text-decoration: underline; }
                `}} />
                <EditorContent editor={editor} className="prompter-content outline-none" />
            </div>

            {/* Controls (Fade out when not hovering) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-900/90 border border-stone-700 p-4 rounded-2xl flex items-center gap-6 opacity-20 hover:opacity-100 transition-opacity z-50 shadow-2xl backdrop-blur-md">

                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Size</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFontSize(f => Math.max(24, f - 4))}
                            className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 text-stone-300 transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-12 text-center text-sm font-mono text-white">{fontSize}</span>
                        <button
                            onClick={() => setFontSize(f => Math.min(150, f + 4))}
                            className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 text-stone-300 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                <div className="w-px h-10 bg-stone-700" />

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const nextSpeed = Math.max(0, scrollSpeed - 0.5);
                            setScrollSpeed(nextSpeed);
                            if (nextSpeed === 0) setIsPlaying(false);
                        }}
                        className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300 transition-colors"
                        title="Reduce Speed"
                    >
                        <Rewind size={20} />
                    </button>

                    <button
                        onClick={() => {
                            if (!isPlaying && scrollSpeed === 0) {
                                setScrollSpeed(2.0); // Default start speed
                            }
                            setIsPlaying(!isPlaying);
                        }}
                        className={cn(
                            "w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg transition-all",
                            isPlaying ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        )}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                    </button>

                    <button
                        onClick={() => {
                            setScrollSpeed(s => Math.min(10, s === 0 ? 1 : s + 0.5));
                            setIsPlaying(true);
                        }}
                        className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300 transition-colors"
                        title="Increase Speed"
                    >
                        <FastForward size={20} />
                    </button>
                </div>

                <div className="w-px h-10 bg-stone-700" />

                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Speed</span>
                    <span className="w-12 text-center text-sm font-mono text-emerald-400">{scrollSpeed.toFixed(1)}x</span>
                </div>

                <div className="w-px h-10 bg-stone-700" />

                <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-300"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

            </div>
        </div>
    );
};
