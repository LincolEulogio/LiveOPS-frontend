'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser, useRoles } from '@/features/users/hooks/useUsers';
import { Users, Plus, Trash2, Shield, Loader2, Edit2, Info, X, Save, Mail, UserIcon, Calendar, Fingerprint } from 'lucide-react';
import { User } from '@/features/users/types/user.types';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();

    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState({ email: '', name: '', password: '', globalRoleId: '' });

    const openCreate = () => {
        setForm({ email: '', name: '', password: '', globalRoleId: '' });
        setModalMode('create');
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setForm({ email: user.email, name: user.name || '', password: '', globalRoleId: user.globalRoleId || '' });
        setModalMode('edit');
    };

    const openView = (user: User) => {
        setSelectedUser(user);
        setModalMode('view');
    };

    const closeModals = () => {
        setModalMode(null);
        setSelectedUser(null);
        setForm({ email: '', name: '', password: '', globalRoleId: '' });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await createMutation.mutateAsync(form);
                toast.success('User created successfully');
            } else if (modalMode === 'edit' && selectedUser) {
                const updateData = { ...form };
                if (!updateData.password) delete (updateData as any).password;
                await updateMutation.mutateAsync({ id: selectedUser.id, data: updateData });
                toast.success('User updated successfully');
            }
            closeModals();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Failed to save user');
        }
    };

    if (usersLoading || rolesLoading) {
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
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Users className="text-indigo-400" /> Global User Management
                    </h1>
                    <p className="text-muted text-sm mt-1">Manage global user accounts and their details.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Modal system */}
            {modalMode && modalMode !== 'view' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-card-bg border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={closeModals} className="text-muted hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            {modalMode === 'create' ? <Plus size={20} className="text-indigo-400" /> : <Edit2 size={20} className="text-indigo-400" />}
                            {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    disabled={modalMode === 'edit'}
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                                    {modalMode === 'create' ? 'Password' : 'New Password (optional)'}
                                </label>
                                <input
                                    type="password"
                                    required={modalMode === 'create'}
                                    minLength={6}
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder={modalMode === 'create' ? '••••••••' : 'Leave empty to keep current'}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">System Role</label>
                                <select
                                    value={form.globalRoleId}
                                    onChange={(e) => setForm(f => ({ ...f, globalRoleId: e.target.value }))}
                                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">No Global Role</option>
                                    {roles?.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modalMode === 'view' && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-card-bg border border-card-border rounded-xl p-8 w-full max-w-lg shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={closeModals} className="text-muted hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-card-border">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl font-bold text-indigo-400">
                                {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-1">{selectedUser.name}</h2>
                                <div className="flex items-center gap-2 text-muted">
                                    <Shield size={16} className="text-indigo-400" />
                                    <span className="text-sm font-medium">{selectedUser.globalRole?.name || 'Standard User'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-card-border flex items-center justify-center text-muted group-hover:text-indigo-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm text-foreground">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-card-border flex items-center justify-center text-muted group-hover:text-indigo-400 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Member Since</p>
                                        <p className="text-sm text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-card-border flex items-center justify-center text-muted group-hover:text-indigo-400 transition-colors">
                                        <Fingerprint size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">System Identifier</p>
                                        <p className="text-xs text-muted font-mono">{selectedUser.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 flex justify-end">
                            <button
                                onClick={() => openEdit(selectedUser)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-card-bg">
                        <tr className="border-b border-card-border text-[10px] font-bold text-muted uppercase tracking-widest">
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Global Role</th>
                            <th className="py-4 px-6">Created At</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {users?.map(user => (
                            <tr key={user.id} className="hover:bg-indigo-500/5 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-background border border-card-border flex items-center justify-center text-xs font-bold text-indigo-400/60">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => openView(user)}
                                                className="text-sm font-medium text-foreground hover:text-indigo-400 transition-colors text-left block"
                                            >
                                                {user.name}
                                            </button>
                                            <p className="text-[11px] text-muted font-mono tracking-tight">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {user.globalRole ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-medium text-indigo-400">
                                            <Shield size={10} /> {user.globalRole.name}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-muted italic">No Role</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-sm text-muted font-mono text-[10px]">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openView(user)}
                                            className="p-2 text-muted hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Info size={16} />
                                        </button>
                                        <button
                                            onClick={() => openEdit(user)}
                                            className="p-2 text-muted hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                                    try {
                                                        await deleteMutation.mutateAsync(user.id);
                                                        toast.success('User deleted successfully');
                                                    } catch (err: any) {
                                                        toast.error(err.message || 'Failed to delete user');
                                                    }
                                                }
                                            }}
                                            className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-muted text-sm">
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
