'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProduction, useUpdateProduction } from '@/features/productions/hooks/useProductions';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users, Plus, X, Shield, Mail } from 'lucide-react';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useAssignUser, useRemoveUser } from '@/features/productions/hooks/useProductions';
import { showAlert } from '@/shared/utils/swal';

const updateProductionSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    engineType: z.nativeEnum(EngineType),
    status: z.nativeEnum(ProductionStatus),
    obsConfig: z.object({
        host: z.string().optional(),
        port: z.string().optional(),
        password: z.string().optional(),
    }).optional(),
    vmixConfig: z.object({
        host: z.string().optional(),
        port: z.string().optional(),
        pollingInterval: z.number().min(100).max(5000).optional(),
    }).optional(),
});

type EditFormValues = z.infer<typeof updateProductionSchema>;

export default function EditProductionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data: production, isLoading } = useProduction(id);
    const updateMutation = useUpdateProduction();
    const [error, setError] = useState<string | null>(null);
    const { data: globalUsers } = useUsers();
    const assignUserMutation = useAssignUser();
    const removeUserMutation = useRemoveUser();
    const [selectedEmail, setSelectedEmail] = useState('');
    const [isManagingTeam, setIsManagingTeam] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid, isDirty },
    } = useForm<EditFormValues>({
        resolver: zodResolver(updateProductionSchema),
        mode: 'onChange',
    });

    const activeEngineType = watch('engineType');

    const parseUrl = (url: string | undefined, protocol: 'ws' | 'http') => {
        if (!url) return { host: '127.0.0.1', port: protocol === 'ws' ? '4455' : '8088' };
        try {
            const cleanUrl = url.includes('://') ? url : `${protocol}://${url}`;
            const parsed = new URL(cleanUrl);
            return {
                host: parsed.hostname || '127.0.0.1',
                port: parsed.port || (protocol === 'ws' ? '4455' : '8088'),
            };
        } catch (e) {
            return { host: '127.0.0.1', port: protocol === 'ws' ? '4455' : '8088' };
        }
    };

    useEffect(() => {
        if (production) {
            const obs = parseUrl(production.obsConnection?.url, 'ws');
            const vmix = parseUrl(production.vmixConnection?.url, 'http');

            reset({
                name: production.name,
                description: production.description || '',
                engineType: production.engineType,
                status: production.status,
                obsConfig: {
                    host: obs.host,
                    port: obs.port,
                    password: production.obsConnection?.password || '',
                },
                vmixConfig: {
                    host: vmix.host,
                    port: vmix.port,
                    pollingInterval: production.vmixConnection?.pollingInterval || 500,
                }
            });
        }
    }, [production, reset]);

    const onSubmit = async (formData: EditFormValues) => {
        try {
            setError(null);
            await updateMutation.mutateAsync({
                id,
                data: formData,
            });
            showAlert('¡Éxito!', 'Producción actualizada correctamente.', 'success');
            router.push(`/productions/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update production');
        }
    };

    const handleAddMember = async () => {
        if (!selectedEmail) return;
        try {
            const user = globalUsers?.find(u => u.email === selectedEmail);
            const roleName = user?.globalRole?.name || 'VIEWER';

            setIsManagingTeam(true);
            await assignUserMutation.mutateAsync({ id, email: selectedEmail, roleName });
            setSelectedEmail('');
            showAlert('¡Miembro Añadido!', `Usuario ${selectedEmail} agregado.`, 'success');
        } catch (err: any) {
            showAlert('Error', err.message || 'No se pudo añadir al usuario.', 'error');
        } finally {
            setIsManagingTeam(false);
        }
    };

    const handleRemoveMember = async (userId: string, email: string) => {
        try {
            setIsManagingTeam(true);
            await removeUserMutation.mutateAsync({ id, userId });
            showAlert('Eliminado', `Usuario ${email} removido.`, 'success');
        } catch (err: any) {
            showAlert('Error', err.message || 'No se pudo remover al usuario.', 'error');
        } finally {
            setIsManagingTeam(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="mb-6">
                <Link
                    href={`/productions/${id}`}
                    className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-medium mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Production
                </Link>
                <h1 className="text-2xl font-bold text-foreground ">Edit Production</h1>
                <p className="text-muted text-sm mt-1">Update your live streaming configuration</p>
            </div>

            <div className="bg-card-bg border border-card-border rounded-xl p-6 ">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Production Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Engine Type</label>
                            <select
                                {...register('engineType')}
                                className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            >
                                <option value={EngineType.OBS}>OBS Studio</option>
                                <option value={EngineType.VMIX}>vMix</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                            <select
                                {...register('status')}
                                className="w-full bg-background border border-card-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            >
                                <option value={ProductionStatus.SETUP}>Setup</option>
                                <option value={ProductionStatus.ACTIVE}>Active</option>
                                <option value={ProductionStatus.ARCHIVED}>Archived</option>
                                <option value={ProductionStatus.DRAFT}>Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Connection Config */}
                    <div className="p-4 bg-background border border-card-border rounded-lg space-y-4">
                        <h3 className="text-xs font-bold text-muted uppercase ">
                            {activeEngineType} Connection Settings
                        </h3>

                        {activeEngineType === EngineType.OBS && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-bold text-muted uppercase mb-1">Server IP / Host</label>
                                    <input
                                        {...register('obsConfig.host')}
                                        type="text"
                                        placeholder="127.0.0.1"
                                        className="w-full bg-background border border-card-border rounded-md px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-bold text-muted uppercase mb-1">Port</label>
                                    <input
                                        {...register('obsConfig.port')}
                                        type="text"
                                        placeholder="4455"
                                        className="w-full bg-background border border-card-border rounded-md px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-bold text-muted uppercase mb-1">WS Password</label>
                                    <input
                                        {...register('obsConfig.password')}
                                        type="password"
                                        placeholder="Optional"
                                        className="w-full bg-background border border-card-border rounded-md px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {activeEngineType === EngineType.VMIX && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Server IP / Host</label>
                                        <input
                                            {...register('vmixConfig.host')}
                                            type="text"
                                            placeholder="127.0.0.1"
                                            className="w-full bg-background border border-card-border rounded-md px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Port</label>
                                        <input
                                            {...register('vmixConfig.port')}
                                            type="text"
                                            placeholder="8088"
                                            className="w-full bg-background border border-card-border rounded-md px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="block text-[10px] font-bold text-muted uppercase">Polling Interval</label>
                                        <span className="text-[10px] font-mono text-indigo-400">{watch('vmixConfig.pollingInterval')}ms</span>
                                    </div>
                                    <input
                                        {...register('vmixConfig.pollingInterval', { valueAsNumber: true })}
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="100"
                                        className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <p className="text-[10px] text-muted">Frequency of API requests to vMix. Lower values provide faster feedback but increase CPU/Network load.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
                        <Link
                            href={`/productions/${id}`}
                            className="px-4 py-2 rounded-md text-foreground hover:bg-background transition-colors font-medium text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending || !isValid || !isDirty}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                <div className="mt-10 pt-10 border-t border-card-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users size={18} className="text-indigo-400" />
                        Team Management
                    </h3>

                    <div className="flex gap-2 mb-6">
                        <div className="flex-1">
                            <select
                                value={selectedEmail}
                                onChange={(e) => setSelectedEmail(e.target.value)}
                                className="w-full bg-background border border-card-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                            >
                                <option value="">Select a user to invite...</option>
                                {globalUsers?.filter(u => !production?.users?.some((pu: any) => pu.userId === u.id)).map(u => (
                                    <option key={u.id} value={u.email}>
                                        {u.name || u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddMember}
                            disabled={!selectedEmail || isManagingTeam}
                            className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold  "
                        >
                            <Plus size={18} /> {isManagingTeam ? 'Adding...' : 'Add'}
                        </button>
                    </div>

                    <div className="space-y-2 bg-background border border-card-border rounded-2xl p-4">
                        {production?.users?.map((pu: any) => (
                            <div key={pu.userId} className="flex items-center justify-between py-2 px-3 hover:bg-card-bg/50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-card-bg border border-card-border flex items-center justify-center text-xs font-black text-muted uppercase">
                                        {(pu.user.name || pu.user.email).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {pu.user.name || pu.user.email}
                                        </p>
                                        <p className="text-[10px] font-black text-muted uppercase  mt-0.5">
                                            {pu.role.name} {pu.role.name === 'ADMIN' && ' (Propio)'}
                                        </p>
                                    </div>
                                </div>
                                {pu.role.name !== 'ADMIN' && pu.role.name !== 'SUPERADMIN' && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(pu.userId, pu.user.email)}
                                        disabled={isManagingTeam}
                                        className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
