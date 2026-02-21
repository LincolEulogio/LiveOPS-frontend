'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProductions } from '@/features/productions/hooks/useProductions';
import { Production } from '@/features/productions/types/production.types';
import { Shield, Layout, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { data: productionsResponse, isLoading, error } = useProductions();
  const productions = productionsResponse?.data || [];

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center gap-6 bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl">
        <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-600/20">
          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white tracking-tight">{user.name || 'User'}</h1>
          <p className="text-stone-400 font-medium">{user.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={22} className="text-indigo-400" />
          Production Roles & Permissions
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed">
            <Loader2 className="animate-spin text-stone-600 mb-2" size={32} />
            <p className="text-stone-500 text-sm italic">Synchronizing roles across environment...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={20} />
            <span>Failed to load production access data.</span>
          </div>
        ) : productions.length === 0 ? (
          <div className="p-12 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed text-center">
            <p className="text-stone-500 italic">No productions assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productions.map((prod: Production) => {
              const myEntry = prod.users?.find(u => u.userId === user.id);
              const myRole = myEntry?.role;

              return (
                <div key={prod.id} className="bg-stone-900 border border-stone-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Layout size={18} className="text-stone-500 group-hover:text-indigo-400 transition-colors" />
                      <h3 className="font-semibold text-white">{prod.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {myRole?.name || 'VIEWER'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Active Permissions</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {/* In a real app, role.permissions would be an array of strings */}
                      {/* Here we might just show some based on the role name or if the data exists */}
                      {myRole?.name === 'ADMIN' && (
                        ['manage_team', 'manage_engine', 'orchestrate', 'chat'].map(p => (
                          <span key={p} className="px-2 py-0.5 bg-stone-950 border border-stone-800 rounded text-[9px] text-stone-400 uppercase">
                            {p.replace('_', ' ')}
                          </span>
                        ))
                      )}
                      {myRole?.name === 'OPERATOR' && (
                        ['orchestrate', 'chat', 'view_analytics'].map(p => (
                          <span key={p} className="px-2 py-0.5 bg-stone-950 border border-stone-800 rounded text-[9px] text-stone-400 uppercase">
                            {p.replace('_', ' ')}
                          </span>
                        ))
                      )}
                      {(!myRole || (myRole.name !== 'ADMIN' && myRole.name !== 'OPERATOR')) && (
                        <span className="text-[10px] text-stone-600 italic">Read-only access</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/productions/${prod.id}`}
                    className="mt-6 flex items-center justify-center py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
                  >
                    Enter Production
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
