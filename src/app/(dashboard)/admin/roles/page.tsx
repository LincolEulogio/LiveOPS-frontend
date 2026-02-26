'use client';

import { useState } from 'react';
import { useRoles, usePermissions, useUpdateRolePermissions, useCreateRole, useDeleteRole, useUpdateRole } from '@/features/users/hooks/useUsers';
import { Shield, Loader2, Key, CheckCircle2, Square, Plus, Trash2, X, Edit2, Activity, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { Role } from '@/features/users/types/user.types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { RolesSkeleton } from '@/shared/components/SkeletonLoaders';

export default function AdminRolesPage() {
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = usePermissions();
    const updatePermsMutation = useUpdateRolePermissions();
    const createRoleMutation = useCreateRole();
    const deleteRoleMutation = useDeleteRole();
    const updateRoleMutation = useUpdateRole();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formRole, setFormRole] = useState({ name: '', description: '' });

    const togglePermission = async (roleId: string, permissionId: string, isAssigned: boolean) => {
        const role = roles?.find((r: Role) => r.id === roleId);
        if (!role) return;

        const currentPermIds = role.permissions?.map((p: any) => p.permissionId) || [];
        const newPermIds = isAssigned
            ? currentPermIds.filter((id: string) => id !== permissionId)
            : [...currentPermIds, permissionId];

        try {
            await updatePermsMutation.mutateAsync({ roleId, permissionIds: newPermIds });
            toast.success('Security matrix updated');
        } catch (err) {
            toast.error('Failed to update permissions');
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoleMutation.mutateAsync(formRole);
            setFormRole({ name: '', description: '' });
            setIsCreateModalOpen(false);
            toast.success('New tactical role authorized');
        } catch (err) {
            toast.error('Authorization failed');
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;
        try {
            await updateRoleMutation.mutateAsync({ id: editingRole.id, data: formRole });
            setIsEditModalOpen(false);
            setEditingRole(null);
            toast.success('Role parameters updated');
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const handleDeleteRole = async (id: string, name: string) => {
        const result = await showConfirm(
            `Deauthorize "${name}"?`,
            'This will permanently remove this security node from the system.',
            'Yes, deauthorize'
        );
        if (!result.isConfirmed) return;
        try {
            await deleteRoleMutation.mutateAsync(id);
            showAlert('Deauthorized', 'Security node purged from system.', 'success');
        } catch (err) {
            showAlert('Failed', 'Deauthorization failed. Try again.', 'error');
        }
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormRole({ name: role.name, description: role.description || '' });
        setIsEditModalOpen(true);
    };

    if (rolesLoading || permsLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-12 pb-24">
                <div className="flex justify-between items-center mb-12">
                    <div className="space-y-4">
                        <div className="h-10 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl" />
                        <div className="h-4 w-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-xl" />
                    </div>
                </div>
                <RolesSkeleton />
            </div>
        );
    }

    return (
        <div className="max-w-[1800px] mx-auto space-y-8 p-6 lg:p-12 pb-24">
            {/* Tactical Header */}
            <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-center">
                <div className="relative">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                            <Shield className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Permissions Matrix</h1>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-muted-foreground/60 dark:text-muted uppercase tracking-[0.2em]">Auth Protocol: ACTIVE</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground/70 dark:text-muted/60 text-[11px] font-medium tracking-wide ml-16">Manage system access levels and tactical operational roles.</p>
                </div>
                <button
                    onClick={() => {
                        setFormRole({ name: '', description: '' });
                        setIsCreateModalOpen(true);
                    }}
                    className="group relative px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Plus size={16} /> New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {roles?.map((role: Role) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="group relative bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl dark:shadow-none transition-all flex flex-col h-full overflow-hidden"
                    >
                        {/* Objective 3: Scanning Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-500/3 to-transparent h-[20%] w-full -translate-y-full group-hover:animate-scan" />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tight group-hover:text-indigo-500 transition-colors">{role.name}</h3>
                                <p className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-[0.2em] leading-none">System Security Node</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(role)}
                                    className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border border-black/5 dark:border-white/10 rounded-xl text-muted-foreground dark:text-white transition-all active:scale-95"
                                    title="Configure Role Parameters"
                                >
                                    <Edit2 size={14} />
                                </button>
                                {(!['ADMIN', 'SUPERADMIN'].includes(role.name)) && (
                                    <button
                                        onClick={() => handleDeleteRole(role.id, role.name)}
                                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-600/20 border border-black/5 dark:border-white/10 rounded-xl text-muted-foreground dark:text-white transition-all active:scale-95"
                                        title="Immediate Deauthorization"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground/80 dark:text-muted/70 mb-8 italic line-clamp-2 min-h-10 leading-relaxed tracking-wide">
                            {role.description || 'System access node calibrated for specialized operations.'}
                        </p>

                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black text-foreground/80 dark:text-white uppercase tracking-[0.2em]">Authorized Protocols</span>
                                </div>
                                <span className="text-[9px] font-black text-indigo-500/40 uppercase tracking-widest">{role.permissions?.length || 0} Layers</span>
                            </div>

                            {/* Scrollable Permission Matrix */}
                            <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar border-t border-black/5 dark:border-white/5 pt-4">
                                {permissions?.map((perm: any) => {
                                    const isAssigned = role.permissions?.some((rp: any) => rp.permissionId === perm.id);
                                    return (
                                        <button
                                            key={perm.id}
                                            onClick={() => togglePermission(role.id, perm.id, !!isAssigned)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] group/item",
                                                isAssigned
                                                    ? "bg-indigo-600 dark:bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/20 text-white dark:text-indigo-400"
                                                    : "bg-gray-50 dark:bg-white/2 border-black/5 dark:border-white/5 text-muted-foreground dark:text-white/30 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="text-left">
                                                <div className={cn(
                                                    "text-[11px] font-black uppercase tracking-widest mb-0.5 transition-colors",
                                                    isAssigned ? "text-white dark:text-indigo-300" : "text-foreground dark:text-white/60 group-hover/item:text-indigo-500"
                                                )}>
                                                    {perm.name}
                                                </div>
                                                <div className={cn(
                                                    "text-[13px] font-medium italic line-clamp-1 transition-opacity",
                                                    isAssigned ? "text-white/60 dark:text-indigo-400/60" : "text-muted-foreground/50 group-hover/item:opacity-80"
                                                )}>
                                                    {perm.description}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                isAssigned
                                                    ? "bg-white/20 text-white dark:bg-indigo-400/20 dark:text-indigo-400"
                                                    : "bg-black/5 dark:bg-white/5 text-muted-foreground/20 dark:text-white/10 group-hover/item:text-indigo-500/40"
                                            )}>
                                                {isAssigned ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#0a0a0f] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg relative z-110 shadow-3xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                className="absolute top-6 right-6 p-2 text-muted-foreground dark:text-muted hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic mb-8 flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400">
                                    <Shield size={20} />
                                </div>
                                {isEditModalOpen ? 'Edit Role Parameters' : 'Authorize New Role'}
                            </h2>

                            <form onSubmit={isEditModalOpen ? handleUpdateRole : handleCreateRole} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1">Protocol Identifier (Name)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formRole.name}
                                        onChange={e => setFormRole(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground dark:text-white placeholder:text-muted/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all dark:shadow-inner"
                                        placeholder="e.g., SECTOR_CHIEF"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1">Operational Directive (Description)</label>
                                    <textarea
                                        value={formRole.description}
                                        onChange={e => setFormRole(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-foreground dark:text-white placeholder:text-muted/20 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[120px] resize-none transition-all dark:shadow-inner"
                                        placeholder="Define mission scope..."
                                    />
                                </div>

                                <div className="flex gap-4 mt-10 pt-6 border-t border-black/5 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                        className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                                        className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {isEditModalOpen ? 'Commit Parameters' : 'Authorize Protocol'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
