'use client';

import { useState } from 'react';
import { useRoles, usePermissions, useUpdateRolePermissions, useCreateRole, useDeleteRole } from '@/features/users/hooks/useUsers';
import { Shield, Loader2, Key, CheckSquare, Square, Plus, Trash2, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@/features/users/types/user.types';

export default function AdminRolesPage() {
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = usePermissions();
    const updatePermsMutation = useUpdateRolePermissions();
    const createRoleMutation = useCreateRole();
    const deleteRoleMutation = useDeleteRole();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    const togglePermission = async (roleId: string, permissionId: string, isAssigned: boolean) => {
        const role = roles?.find((r: Role) => r.id === roleId);
        if (!role) return;

        const currentPermIds = role.permissions?.map((p: any) => p.permissionId) || [];
        const newPermIds = isAssigned
            ? currentPermIds.filter((id: string) => id !== permissionId)
            : [...currentPermIds, permissionId];

        try {
            await updatePermsMutation.mutateAsync({ roleId, permissionIds: newPermIds });
            toast.success('Permissions updated');
        } catch (err) {
            toast.error('Failed to update permissions');
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoleMutation.mutateAsync(newRole);
            setNewRole({ name: '', description: '' });
            setIsCreateModalOpen(false);
            toast.success('Role created successfully');
        } catch (err) {
            toast.error('Failed to create role');
        }
    };

    const handleDeleteRole = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the role "${name}"? This cannot be undone.`)) return;
        try {
            await deleteRoleMutation.mutateAsync(id);
            toast.success('Role deleted');
        } catch (err) {
            toast.error('Failed to delete role');
        }
    };

    if (rolesLoading || permsLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-indigo-400" /> Roles & Permissions
                    </h1>
                    <p className="text-stone-400 text-sm mt-1">Manage system roles and their assigned permissions.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} /> New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles?.map(role => (
                    <div key={role.id} className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Shield size={64} />
                        </div>

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h2 className="text-lg font-bold text-white">{role.name}</h2>
                            {role.name !== 'ADMIN' && (
                                <button
                                    onClick={() => handleDeleteRole(role.id, role.name)}
                                    className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                                    title="Delete Role"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-stone-400 mb-6 min-h-[40px] relative z-10">{role.description || 'No description provided.'}</p>

                        <div className="flex-1 relative z-10">
                            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Key size={12} /> Permissions
                            </h3>
                            <div className="space-y-1">
                                {permissions?.map(permission => {
                                    const isAssigned = role.permissions?.some((rp: any) => rp.permissionId === permission.id) ?? false;
                                    return (
                                        <button
                                            key={permission.id}
                                            onClick={() => togglePermission(role.id, permission.id, isAssigned)}
                                            disabled={updatePermsMutation.isPending}
                                            className={`w-full flex items-center justify-between p-2 rounded text-[10px] font-mono border transition-all ${isAssigned
                                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                                                : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-700'
                                                }`}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold">{permission.action}</span>
                                                <span className="text-[8px] opacity-60 font-sans tracking-tight">{permission.description}</span>
                                            </div>
                                            {isAssigned ? <CheckSquare size={14} /> : <Square size={14} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
                {roles?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-stone-500 text-sm bg-stone-900 border border-stone-800 rounded-xl">
                        No roles found in the system.
                    </div>
                )}
            </div>

            {/* Create Role Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Plus size={22} className="text-indigo-400" /> Create New Role
                        </h2>
                        <form onSubmit={handleCreateRole} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 pl-1">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newRole.name}
                                    onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g., MODERATOR"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 pl-1">Description</label>
                                <textarea
                                    value={newRole.description}
                                    onChange={e => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none min-h-[100px]"
                                    placeholder="Describe what this role can do..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-stone-800/50">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createRoleMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                                >
                                    {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
