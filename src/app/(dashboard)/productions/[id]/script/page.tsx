'use client';

import { useParams, useRouter } from 'next/navigation';
import { ScriptEditor } from '@/features/script/components/ScriptEditor';
import { ArrowLeft, FileText, Share2, Save, MoreVertical, Download, Trash2, Printer } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function ScriptPreparationPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] max-w-7xl mx-auto">
            {/* Context Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/productions/${id}`}
                        className="p-2 hover:bg-card-bg rounded-xl text-muted hover:text-foreground transition-colors border border-transparent hover:border-card-border"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <FileText size={16} className="text-indigo-400" />
                            <h1 className="text-lg font-bold text-foreground ">Preparación de Guion</h1>
                        </div>
                        <p className="text-[10px] text-muted uppercase  font-bold font-mono">
                            Modo: Colaboración en Tiempo Real
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('¡Enlace de colaboración copiado!');
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-background border border-card-border rounded-lg text-[10px] font-bold text-muted uppercase  hover:text-foreground hover:bg-card-bg transition-all"
                    >
                        <Share2 size={12} />
                        Compartir
                    </button>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="p-1.5 hover:bg-card-bg border border-transparent hover:border-card-border rounded-lg text-muted transition-colors outline-none focus:border-card-border">
                                <MoreVertical size={16} />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={5}
                                className="min-w-[180px] bg-card-bg border border-card-border rounded-xl p-1  z-50 animate-in fade-in zoom-in duration-100"
                            >
                                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-muted hover:text-foreground hover:bg-card-border rounded-lg outline-none cursor-pointer transition-colors">
                                    <Download size={14} className="text-indigo-400" />
                                    Exportar (.docx)
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-muted hover:text-foreground hover:bg-card-border rounded-lg outline-none cursor-pointer transition-colors">
                                    <Printer size={14} className="text-emerald-400" />
                                    Imprimir Guion
                                </DropdownMenu.Item>

                                <div className="h-px bg-card-border my-1" />

                                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg outline-none cursor-pointer transition-colors">
                                    <Trash2 size={14} />
                                    Limpiar Guion
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 min-h-0 bg-background border border-card-border rounded-2xl  overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col min-h-0">
                    <ScriptEditor productionId={id} />
                </div>

                {/* Footer / Status */}
                <div className="py-2 px-6 border-t border-card-border flex justify-between items-center bg-card-bg/40 backdrop-blur-sm">
                    <div className="text-[9px] text-muted font-medium uppercase er">
                        Todos los cambios se guardan automáticamente
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-[9px] text-muted font-mono er uppercase">Conectado</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
