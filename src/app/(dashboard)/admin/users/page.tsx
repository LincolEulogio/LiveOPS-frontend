'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser } from '@/features/users/hooks/useUsers';
import { Users, Plus, Trash2, Shield, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
    const { data: users, isLoading } = useUsers();
    const createMutation = useCreateUser();
    const deleteMutation = useDeleteUser();

    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ email: '', name: '', password: '' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync(form);
            setIsCreating(false);
            setForm({ email: '', name: '', password: '' });
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-indigo-400" /> Global User Management
                    </h1>
                    <p className="text-stone-400 text-sm mt-1">Manage global user accounts and their details.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">Create New User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-stone-900">
                        <tr className="border-b border-stone-800 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Email</th>
                            <th className="py-4 px-6">Created At</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                        {users?.map(user => (
                            <tr key={user.id} className="hover:bg-indigo-500/5 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-stone-400">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-stone-500 font-mono">ID: {user.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-stone-300">
                                    {user.email}
                                </td>
                                <td className="py-4 px-6 text-sm text-stone-400 font-mono text-[10px]">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this user?')) {
                                                deleteMutation.mutate(user.id);
                                            }
                                        }}
                                        className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-stone-500 text-sm">
                                    No users found in the system.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
