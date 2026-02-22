'use client';

import { useParams, useRouter } from 'next/navigation';
import { ScriptEditor } from '@/features/script/components/ScriptEditor';
import { ArrowLeft, FileText, Share2, Save, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function ScriptPreparationPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] max-w-7xl mx-auto">
            {/* Context Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors border border-transparent hover:border-stone-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <FileText size={16} className="text-indigo-400" />
                            <h1 className="text-lg font-bold text-white tracking-tight">Preparación de Guion</h1>
                        </div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold font-mono">
                            Modo: Colaboración en Tiempo Real
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-white transition-all">
                        <Share2 size={12} />
                        Compartir
                    </button>
                    <button className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-500">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 min-h-0 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col">
                <div className="flex-1">
                    <ScriptEditor productionId={id} />
                </div>

                {/* Footer / Status */}
                <div className="py-2 px-6 border-t border-stone-800/50 flex justify-between items-center bg-stone-900/50 backdrop-blur-sm">
                    <div className="text-[9px] text-stone-600 font-medium uppercase tracking-tighter">
                        Todos los cambios se guardan automáticamente
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-[9px] text-stone-500 font-mono tracking-tighter">CONECTADO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
