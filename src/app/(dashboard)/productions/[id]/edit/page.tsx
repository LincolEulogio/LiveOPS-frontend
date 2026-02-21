'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProduction, useUpdateProduction } from '@/features/productions/hooks/useProductions';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

const updateProductionSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    engineType: z.nativeEnum(EngineType),
    status: z.nativeEnum(ProductionStatus),
    obsConfig: z.object({
        url: z.string().optional(),
        password: z.string().optional(),
    }).optional(),
    vmixConfig: z.object({
        url: z.string().optional(),
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

    useEffect(() => {
        if (production) {
            reset({
                name: production.name,
                description: production.description || '',
                engineType: production.engineType,
                status: production.status,
                obsConfig: {
                    url: production.obsConnection?.url || 'ws://127.0.0.1:4455',
                    password: production.obsConnection?.password || '',
                },
                vmixConfig: {
                    url: production.vmixConnection?.url || 'http://127.0.0.1:8088',
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
            router.push(`/productions/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update production');
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
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href={`/productions/${id}`}
                    className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Production
                </Link>
                <h1 className="text-2xl font-bold text-white tracking-tight">Edit Production</h1>
                <p className="text-stone-400 text-sm mt-1">Update your live streaming configuration</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1">
                            Production Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-300 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Engine Type</label>
                            <select
                                {...register('engineType')}
                                className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            >
                                <option value={EngineType.OBS}>OBS Studio</option>
                                <option value={EngineType.VMIX}>vMix</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-300 mb-2">Status</label>
                            <select
                                {...register('status')}
                                className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            >
                                <option value={ProductionStatus.SETUP}>Setup</option>
                                <option value={ProductionStatus.ACTIVE}>Active</option>
                                <option value={ProductionStatus.ARCHIVED}>Archived</option>
                                <option value={ProductionStatus.DRAFT}>Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Connection Config */}
                    <div className="p-4 bg-stone-950/50 border border-stone-800 rounded-lg space-y-4">
                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                            {activeEngineType} Connection Settings
                        </h3>

                        {activeEngineType === EngineType.OBS && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">WebSocket URL</label>
                                    <input
                                        {...register('obsConfig.url')}
                                        type="text"
                                        placeholder="ws://127.0.0.1:4455"
                                        className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-100 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">WS Password</label>
                                    <input
                                        {...register('obsConfig.password')}
                                        type="password"
                                        placeholder="Optional"
                                        className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-100 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {activeEngineType === EngineType.VMIX && (
                            <div>
                                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Web Controller URL</label>
                                <input
                                    {...register('vmixConfig.url')}
                                    type="text"
                                    placeholder="http://127.0.0.1:8088"
                                    className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-100 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-stone-800">
                        <Link
                            href={`/productions/${id}`}
                            className="px-4 py-2 rounded-md text-stone-300 hover:text-white hover:bg-stone-800 transition-colors font-medium text-sm"
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
            </div>
        </div>
    );
}
