'use client';

import { useRoles, usePermissions, useUpdateRolePermissions } from '@/features/users/hooks/useUsers';
import { Shield, Loader2, Key, CheckSquare, Square } from 'lucide-react';

import { Role } from '@/features/users/types/user.types';

export default function AdminRolesPage() {
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = usePermissions();
    const updatePermsMutation = useUpdateRolePermissions();

    const togglePermission = async (roleId: string, permissionId: string, isAssigned: boolean) => {
        const role = roles?.find((r: Role) => r.id === roleId);
        if (!role) return;

        const currentPermIds = role.permissions?.map((p: any) => p.permissionId) || [];
        const newPermIds = isAssigned
            ? currentPermIds.filter((id: string) => id !== permissionId)
            : [...currentPermIds, permissionId];

        await updatePermsMutation.mutateAsync({ roleId, permissionIds: newPermIds });
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
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="text-indigo-400" /> Roles & Permissions
                </h1>
                <p className="text-stone-400 text-sm mt-1">Manage system roles and their assigned permissions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles?.map(role => (
                    <div key={role.id} className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl relative overflow-hidden group flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Shield size={64} />
                        </div>
                        <h2 className="text-lg font-bold text-white mb-2">{role.name}</h2>
                        <p className="text-sm text-stone-400 mb-6 min-h-[40px]">{role.description || 'No description provided.'}</p>

                        <div className="flex-1">
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
        </div>
    );
}
