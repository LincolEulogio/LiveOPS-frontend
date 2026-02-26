'use client';

import { useParams } from 'next/navigation';
import { PeripheralManager } from '@/features/peripherals/components/PeripheralManager';
import { IntegrationsPanel } from '@/features/productions/components/IntegrationsPanel';
import { useProductionContextInitializer } from '@/features/productions/hooks/useProductionContext';
import { ArrowLeft, Settings, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
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
                            <Settings size={14} className="text-indigo-400" />
                            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Node Configuration</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground/60">Dashboard</span>
                            <span className="text-white/20">/</span>
                            <span className="text-sm font-black text-white uppercase italic">Hardware & System Settings</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <Cpu size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase ">Hardware Sync Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Device Matrix</h3>
                        </div>
                        <div className="p-2">
                            <PeripheralManager productionId={id} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#050508]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">API & Integrations</h3>
                        </div>
                        <div className="p-6">
                            <IntegrationsPanel productionId={id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
