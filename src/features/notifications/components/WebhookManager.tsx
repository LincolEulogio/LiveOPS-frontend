'use client';

import React, { useState } from 'react';
import { useWebhooks, Webhook } from '@/features/notifications/hooks/useWebhooks';
import {
    Bell,
    Plus,
    Trash2,
    ExternalLink,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Send,
    Loader2,
    Settings,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { cn } from '@/shared/utils/cn';

interface WebhookManagerProps {
    productionId: string;
}

export const WebhookManager = ({ productionId }: WebhookManagerProps) => {
    const { webhooks, isLoading, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhooks(productionId);
    const [isAdding, setIsAdding] = useState(false);
    const [newWebhook, setNewWebhook] = useState({ name: '', url: '', platform: 'DISCORD' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWebhook.name || !newWebhook.url) return;

        try {
            await createWebhook.mutateAsync(newWebhook);
            setNewWebhook({ name: '', url: '', platform: 'DISCORD' });
            setIsAdding(false);
        } catch (err) {
            console.error('Failed to create webhook', err);
        }
    };

    const handleTest = async (id: string) => {
        try {
            await testWebhook.mutateAsync(id);
            // Show success toast or feedback
        } catch (err) {
            console.error('Test failed', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Bell className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">External Notifications</h2>
                        <p className="text-stone-400 text-sm">Connect Slack or Discord for real-time alerts</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm"
                        >
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-white">New Integration</h3>
                                    <button type="button" onClick={() => setIsAdding(false)} className="text-stone-500 hover:text-white">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-stone-400 uppercase font-bold mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            placeholder="Production Alert Channel"
                                            value={newWebhook.name}
                                            onChange={e => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-stone-400 uppercase font-bold mb-1 block">Platform</label>
                                        <div className="flex gap-2">
                                            {['DISCORD', 'SLACK', 'GENERIC'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setNewWebhook({ ...newWebhook, platform: p as any })}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                                                        newWebhook.platform === p
                                                            ? "bg-indigo-600 text-white border-indigo-400"
                                                            : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-600"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-stone-400 uppercase font-bold mb-1 block">Webhook URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://discord.com/api/webhooks/..."
                                            value={newWebhook.url}
                                            onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm"
                                    >
                                        Save Integration
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {webhooks.map((webhook: Webhook) => (
                        <motion.div
                            layout
                            key={webhook.id}
                            className={cn(
                                "p-4 rounded-xl border flex flex-col justify-between group transition-all",
                                webhook.isEnabled ? "bg-stone-800/40 border-stone-700" : "bg-stone-900/40 border-stone-800 opacity-60"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                                        webhook.platform === 'DISCORD' ? "bg-indigo-500/20 text-indigo-400" :
                                            webhook.platform === 'SLACK' ? "bg-emerald-500/20 text-emerald-400" : "bg-stone-500/20 text-stone-400"
                                    )}>
                                        {webhook.platform[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white leading-none">{webhook.name}</h4>
                                            {!webhook.isEnabled && <span className="text-[10px] bg-stone-700 text-stone-400 px-1.5 py-0.5 rounded uppercase">Disabled</span>}
                                        </div>
                                        <p className="text-xs text-stone-500 mt-1 truncate max-w-[180px]">{webhook.url}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleTest(webhook.id)}
                                        className="p-1.5 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-indigo-400"
                                        title="Send Test Notification"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const result = await showConfirm(
                                                `¿Eliminar webhook "${webhook.name}"?`,
                                                'Se desconectará esta integración permanentemente.',
                                                'Sí, eliminar'
                                            );
                                            if (result.isConfirmed) {
                                                deleteWebhook.mutate(webhook.id, {
                                                    onSuccess: () => showAlert('Eliminado', 'Webhook desconectado correctamente.', 'success'),
                                                    onError: () => showAlert('Error', 'No se pudo eliminar el webhook.', 'error'),
                                                });
                                            }
                                        }}
                                        className="p-1.5 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-red-400"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-stone-700/50 pt-3 mt-auto">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateWebhook.mutate({ id: webhook.id, isEnabled: !webhook.isEnabled })}
                                        className={cn(
                                            "text-[10px] font-bold uppercase py-1 px-2 rounded transition-colors",
                                            webhook.isEnabled
                                                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                                        )}
                                    >
                                        {webhook.isEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", webhook.isEnabled ? "bg-emerald-500" : "bg-stone-600")} />
                                    {webhook.isEnabled ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {webhooks.length === 0 && !isAdding && (
                    <div className="col-span-1 md:col-span-2 p-12 rounded-2xl border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-center">
                        <Bell className="w-12 h-12 text-stone-700 mb-4" />
                        <h3 className="text-lg font-bold text-stone-500">No webhooks configured</h3>
                        <p className="text-stone-600 text-sm max-w-sm mt-2">
                            Stay informed during the broadcast. Add a Slack or Discord webhook to receive critical stream health alerts and automation triggers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
