'use client';

import { useParams } from 'next/navigation';
import { MediaSidebar } from '@/features/media/components/MediaSidebar';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, FolderOpen, Upload } from 'lucide-react';
import Link from 'next/link';

export default function MediaPage() {
    const params = useParams();
    const id = params.id as string;

    useProductionContextInitializer(id);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 mt-4 px-4 sm:px-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/productions/${id}`}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 text-muted-foreground hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FolderOpen size={14} className="text-indigo-400" />
                            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Cloud Assets</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground/60">Dashboard</span>
                            <span className="text-white/20">/</span>
                            <span className="text-sm font-black text-white uppercase italic">Media Library & Storage</span>
                        </div>
                    </div>
                </div>

                <button className="hidden md:flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                    <Upload size={14} />
                    Upload Asset
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 min-h-[700px]">
                <div className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <MediaSidebar productionId={id} />
                </div>
            </div>
        </div>
    );
}
