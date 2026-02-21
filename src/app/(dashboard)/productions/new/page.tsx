'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateProduction } from '@/features/productions/hooks/useProductions';
import { EngineType, ProductionStatus } from '@/features/productions/types/production.types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const createProductionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  engineType: z.nativeEnum(EngineType),
});

type CreateFormValues = z.infer<typeof createProductionSchema>;

export default function NewProductionPage() {
  const router = useRouter();
  const createMutation = useCreateProduction();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createProductionSchema),
    defaultValues: {
      engineType: EngineType.OBS,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateFormValues) => {
    try {
      setError(null);
      const newProd = await createMutation.mutateAsync({
        ...data,
        status: ProductionStatus.SETUP,
      });
      router.push(`/productions/${newProd.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create production');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/productions"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium mb-4"
        >
          <ArrowLeft size={16} />
          Back to Productions
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create New Production</h1>
        <p className="text-stone-400 text-sm mt-1">Setup a new live streaming environment</p>
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
              placeholder="e.g., Main Stage Day 1"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow resize-none"
              placeholder="Optional overview of this stream..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-3">
              Engine Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  value={EngineType.OBS}
                  {...register('engineType')}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-xl border-2 border-stone-800 bg-stone-950 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 transition-all hover:border-stone-700">
                  <span className="block text-sm font-semibold text-white mb-1">OBS Studio</span>
                  <span className="block text-xs text-stone-400">
                    Standard websocket connection
                  </span>
                </div>
              </label>

              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  value={EngineType.VMIX}
                  {...register('engineType')}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-xl border-2 border-stone-800 bg-stone-950 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 transition-all hover:border-stone-700">
                  <span className="block text-sm font-semibold text-white mb-1">vMix</span>
                  <span className="block text-xs text-stone-400">Advanced API integration</span>
                </div>
              </label>
            </div>
            {errors.engineType && (
              <p className="text-xs text-red-400 mt-1">{errors.engineType.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-800">
            <Link
              href="/productions"
              className="px-4 py-2 rounded-md text-stone-300 hover:text-white hover:bg-stone-800 transition-colors font-medium text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending || !isValid}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Production'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
