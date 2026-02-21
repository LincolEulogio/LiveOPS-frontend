'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProductions } from '@/features/productions/hooks/useProductions';
import { Production } from '@/features/productions/types/production.types';
import { Shield, Layout, AlertCircle, Loader2, Edit2, X, Save, Key, User as UserIcon } from 'lucide-react';
import { authService } from '@/features/auth/api/auth.service';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { data: productionsResponse, isLoading, error } = useProductions();
  const productions = Array.isArray(productionsResponse) ? productionsResponse : (productionsResponse as any)?.data || [];

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', password: '' });
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updateData: any = { name: form.name };
      if (form.password) updateData.password = form.password;

      const updatedUser = await authService.updateProfile(updateData);
      setUser(updatedUser);
      setIsEditing(false);
      setForm(prev => ({ ...prev, password: '' }));
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-600/20">
            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">{user.name || 'User'}</h1>
            <p className="text-stone-400 font-medium">{user.email}</p>
            {user.globalRole && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <Shield size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    System {user.globalRole.name}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest px-3 py-1 bg-stone-950 border border-stone-800 rounded-full">
                  Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-all"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setIsEditing(false)} className="text-stone-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserIcon size={22} className="text-indigo-400" /> Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 pl-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 pl-1">New Password (optional)</label>
                <input
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <p className="text-[10px] text-stone-600 mt-2 italic px-1">Leave empty to keep current password.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-stone-800/50">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              const permissionsData = (myRole?.permissions || []) as any[];
              const permissions = permissionsData.map((p: any) => p.permission.action);

              return (
                <div key={prod.id} className="bg-stone-900 border border-stone-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Layout size={18} className="text-stone-500 group-hover:text-indigo-400 transition-colors" />
                      <h3 className="font-semibold text-white">{prod.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-zinc-800 border border-stone-700 rounded text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                      {myRole?.name || 'VIEWER'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                      <Key size={10} /> Active Permissions
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.length > 0 ? (
                        permissions.map((p: string) => (
                          <span key={p} className="px-2 py-0.5 bg-stone-950 border border-stone-800 rounded text-[9px] text-stone-400 uppercase font-mono">
                            {p}
                          </span>
                        ))
                      ) : (
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
