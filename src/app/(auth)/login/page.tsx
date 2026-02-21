'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { authService } from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/features/auth/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setAuth(response.accessToken, response.user);
      router.push('/productions');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-6">Log in</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
            placeholder="operator@liveops.com"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Password</label>
          <input
            {...register('password')}
            type="password"
            className="w-full bg-stone-950 border border-stone-800 rounded-md px-3 py-2 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-stone-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Register
        </Link>
      </div>
    </div>
  );
}
