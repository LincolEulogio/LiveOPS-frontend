'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">User Profile</h1>

      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-stone-800 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-stone-400">{user.email}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Role & Permissions</h3>

          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user.role?.name}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-medium text-stone-400 mb-3">Assigned Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {user.role?.permissions?.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-1 bg-stone-950 border border-stone-800 rounded text-xs text-stone-300"
                >
                  {perm}
                </span>
              ))}
              {(!user.role?.permissions || user.role.permissions.length === 0) && (
                <span className="text-sm text-stone-600 italic">
                  No specific permissions attached
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
