'use client';

import React from 'react';
import { Sparkles, Youtube, Twitter, Copy, Check, Hash, Bookmark } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

interface SeoPackage {
    title: string;
    description: string;
    tags: string[];
    chapters: { timestamp: string; label: string }[];
    socialPosts: { platform: string; content: string }[];
}

interface Props {
    data: SeoPackage;
}

export const SeoPackageView: React.FC<Props> = ({ data }) => {
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`Copiado: ${field}`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const chapterText = data.chapters.map(c => `${c.timestamp} - ${c.label}`).join('\n');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pb-20">
            {/* Main Content Section */}
            <div className="space-y-8">
                {/* AI Package Header */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                        <Sparkles className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-1">AI Post-Show Assets</h3>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Optimized for algorithms & reach</p>
                    </div>
                </div>

                {/* YouTube Title Card */}
                <div className="bg-card-bg/60 border border-card-border rounded-4xl p-8 relative group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-muted uppercase flex items-center gap-2">
                            <Youtube size={14} className="text-red-500" />
                            YouTube Hook Title
                        </span>
                        <button 
                            onClick={() => handleCopy(data.title, 'Title')}
                            className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-indigo-400"
                        >
                            {copiedField === 'Title' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <p className="text-xl font-black text-foreground italic leading-tight">"{data.title}"</p>
                </div>

                {/* YouTube Chapters */}
                <div className="bg-card-bg/60 border border-card-border rounded-4xl p-8 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-muted uppercase flex items-center gap-2">
                            <Bookmark size={14} className="text-amber-500" />
                            Automated Chapters
                        </span>
                        <button 
                            onClick={() => handleCopy(chapterText, 'Chapters')}
                            className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-indigo-400"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                        {data.chapters.map((c, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-white/2 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all">
                                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                                    {c.timestamp}
                                </span>
                                <span className="text-xs font-bold text-foreground/80 truncate">{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Side Assets Section */}
            <div className="space-y-8">
                {/* Social Hook Cards */}
                <div className="bg-linear-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-4xl p-8 space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Twitter size={14} />
                        Social Media Hooks
                    </h4>
                    
                    <div className="space-y-4">
                        {data.socialPosts.map((post, i) => (
                            <div key={i} className="p-4 bg-background/60 border border-card-border rounded-3xl relative group">
                                <span className="absolute top-4 right-4 text-[7px] font-black text-muted uppercase bg-white/5 px-2 py-0.5 rounded-full">
                                    {post.platform}
                                </span>
                                <p className="text-xs font-medium text-stone-200 leading-relaxed mb-4 pr-12">
                                    {post.content}
                                </p>
                                <button 
                                    onClick={() => handleCopy(post.content, `Post ${i+1}`)}
                                    className="flex items-center gap-2 text-[8px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    <Copy size={10} /> Copy Content
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Tags Cloud */}
                <div className="bg-card-bg/60 border border-card-border rounded-4xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-muted uppercase flex items-center gap-2">
                            <Hash size={14} className="text-emerald-500" />
                            Metadata Tags
                        </span>
                        <button 
                            onClick={() => handleCopy(data.tags.join(', '), 'Tags')}
                            className="p-2 hover:bg-white/5 rounded-xl transition-all text-muted hover:text-indigo-400"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
