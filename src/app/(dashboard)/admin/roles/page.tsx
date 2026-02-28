'use client';

import { useState } from 'react';
import {
  useRoles,
  usePermissions,
  useUpdateRolePermissions,
  useCreateRole,
  useDeleteRole,
  useUpdateRole,
} from '@/features/users/hooks/useUsers';
import {
  Shield,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Edit2,
  Activity,
  Lock,
  Search,
  Layout,
  Video,
  Database,
  Users,
  MessageSquare,
  Wand2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { Role } from '@/features/users/types/user.types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { RolesSkeleton } from '@/shared/components/SkeletonLoaders';
import { Guard } from '@/shared/components/Guard';

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
    <Guard requiredPermissions={['role:manage']}>
      <div className="max-w-[1800px] mx-auto space-y-8 p-6 lg:p-12 pb-24">
        {/* Tactical Header */}
        <div className="flex flex-col gap-8 md:flex-row justify-between items-start md:items-center">
          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-foreground uppercase italic tracking-tighter truncate">
                  Permissions Matrix
                </h1>
                <div className="flex items-center gap-2">
                  <Activity size={10} className="text-emerald-500" />
                  <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Auth Protocol: ACTIVE
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-[10px] sm:text-[11px] font-medium tracking-wide ml-0 sm:ml-16">
              Manage system access levels and tactical operational roles.
            </p>
          </div>
          <button
            onClick={() => {
              setFormRole({ name: '', description: '' });
              setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto group relative px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={16} /> New Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles?.map((role: Role) => {
            // Group permissions by category for better visualization
            const groupedPerms = permissions?.reduce((acc: any, perm: any) => {
              const category = perm.action.split(':')[0] || 'other';
              if (!acc[category]) acc[category] = [];
              acc[category].push(perm);
              return acc;
            }, {});

            const getCategoryIcon = (cat: string) => {
              switch (cat) {
                case 'production':
                  return <Layout size={10} />;
                case 'streaming':
                  return <Video size={10} />;
                case 'admin':
                  return <Shield size={10} />;
                case 'user':
                  return <Users size={10} />;
                case 'social':
                  return <MessageSquare size={10} />;
                case 'automation':
                  return <Wand2 size={10} />;
                case 'script':
                  return <Zap size={10} />;
                default:
                  return <Database size={10} />;
              }
            };

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group relative bg-card-bg/60 backdrop-blur-3xl border border-card-border rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-indigo-500/30"
              >
                {/* Tactical Scanning Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan" />
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.05),_transparent) opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {role.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                        System Security Node
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-3 bg-muted/5 hover:bg-indigo-500/10 border border-card-border rounded-2xl text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                    </button>
                    {role.name !== 'SUPERADMIN' && (
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        className="p-3 bg-muted/5 hover:bg-red-500/10 border border-card-border rounded-2xl text-muted-foreground hover:text-red-500 transition-all active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-medium text-muted-foreground mb-10 italic leading-loose tracking-wide relative z-10 px-4 border-l-2 border-indigo-500/30">
                  {role.description || 'System access node calibrated for specialized operations.'}
                </p>

                <div className="space-y-8 flex-1 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Shield size={12} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-black text-foreground uppercase tracking-[0.25em]">
                        Protocol Matrix
                      </span>
                    </div>
                    <div className="self-start sm:self-auto px-3 py-1 bg-indigo-500/5 dark:bg-white/5 rounded-full border border-card-border">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        {role.permissions?.length || 0} ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Grouped Permission Matrix */}
                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar-premium">
                    {groupedPerms &&
                      Object.entries(groupedPerms).map(([category, perms]: [string, any]) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2 px-2">
                            <div className="text-indigo-600 dark:text-indigo-400 opacity-60 uppercase">
                              {getCategoryIcon(category)}
                            </div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              {category} Sector
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {perms.map((perm: any) => {
                              const isAssigned = role.permissions?.some(
                                (rp: any) =>
                                  rp.permissionId === perm.id || rp.permission?.id === perm.id
                              );
                              const isLocked = ['ADMIN', 'SUPERADMIN'].includes(role.name);

                              return (
                                <button
                                  key={perm.id}
                                  disabled={isLocked}
                                  onClick={() => togglePermission(role.id, perm.id, !!isAssigned)}
                                  className={cn(
                                    'w-full px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.97] group/item relative overflow-hidden',
                                    isAssigned
                                      ? 'bg-linear-to-br from-indigo-700 to-indigo-500 border-indigo-400/30 text-white shadow-lg shadow-indigo-600/20'
                                      : 'bg-muted/5 border-card-border text-foreground hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/5',
                                    isLocked && 'opacity-60 cursor-not-allowed'
                                  )}
                                >
                                  {isAssigned && (
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:animate-shimmer" />
                                  )}

                                  <div className="text-left relative z-10">
                                    <div
                                      className={cn(
                                        'text-[10px] font-black uppercase tracking-widest mb-1 transition-colors',
                                        isAssigned
                                          ? 'text-white'
                                          : 'text-muted-foreground group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'
                                      )}
                                    >
                                      {perm.action.split(':')[1]?.replace(/_/g, ' ') || perm.action}
                                    </div>
                                    <p
                                      className={cn(
                                        'text-[9px] font-medium transition-opacity',
                                        isAssigned ? 'text-white/70' : 'text-muted-foreground/60'
                                      )}
                                    >
                                      {perm.description || 'Access authorization required'}
                                    </p>
                                  </div>

                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-xl flex items-center justify-center transition-all relative z-10',
                                      isAssigned
                                        ? 'bg-white/20 text-white border border-white/30 shadow-inner'
                                        : 'bg-muted/10 border border-card-border text-muted-foreground group-hover/item:border-indigo-500/40 group-hover/item:text-indigo-500'
                                    )}
                                  >
                                    {isAssigned ? (
                                      <CheckCircle2
                                        size={14}
                                        className="animate-in zoom-in duration-300"
                                      />
                                    ) : (
                                      <div className="w-1 h-1 bg-current rounded-full" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {(isCreateModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card-bg/95 backdrop-blur-2xl border border-card-border rounded-[2.5rem] p-10 w-full max-w-lg relative z-110 shadow-3xl overflow-hidden"
              >
                {/* Modal Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -z-10" />
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black text-foreground uppercase italic mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <Shield size={20} />
                  </div>
                  {isEditModalOpen ? 'Edit Role Parameters' : 'Authorize New Role'}
                </h2>

                <form
                  onSubmit={isEditModalOpen ? handleUpdateRole : handleCreateRole}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-1">
                      Protocol Identifier (Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={formRole.name}
                      onChange={(e) =>
                        setFormRole((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))
                      }
                      className="w-full bg-background/50 border border-card-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-muted focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 outline-none transition-all"
                      placeholder="e.g., SECTOR_CHIEF"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pl-1">
                      Operational Directive (Description)
                    </label>
                    <textarea
                      value={formRole.description}
                      onChange={(e) =>
                        setFormRole((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full bg-background/50 border border-card-border rounded-2xl px-6 py-4 text-sm font-medium text-foreground placeholder:text-muted focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 outline-none min-h-[120px] resize-none transition-all"
                      placeholder="Define mission scope..."
                    />
                  </div>

                  <div className="flex gap-4 mt-10 pt-8 border-t border-card-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                      }}
                      className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/5 transition-all"
                    >
                      Abort
                    </button>
                    <button
                      type="submit"
                      disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                      className="flex-2 bg-linear-to-br from-indigo-700 to-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/25 disabled:opacity-50"
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
    </Guard>
  );
}
