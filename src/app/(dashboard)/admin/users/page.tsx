'use client';

import { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useRoles,
} from '@/features/users/hooks/useUsers';
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Loader2,
  Edit2,
  Info,
  X,
  Save,
  Mail,
  Calendar,
  Fingerprint,
  Activity,
  AtSign,
  KeyRound,
  Search,
} from 'lucide-react';
import { User } from '@/features/users/types/user.types';
import { toast } from 'sonner';
import { showConfirm, showAlert } from '@/shared/utils/swal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { UsersSkeleton } from '@/shared/components/SkeletonLoaders';
import { Guard } from '@/shared/components/Guard';
import { Portal } from '@/shared/components/Portal';

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
    setForm({
      email: user.email,
      name: user.name || '',
      password: '',
      globalRoleId: user.globalRoleId || '',
    });
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
        toast.success('Member authorized in system');
      } else if (modalMode === 'edit' && selectedUser) {
        const updateData = { ...form };
        if (!updateData.password) delete (updateData as any).password;
        await updateMutation.mutateAsync({ id: selectedUser.id, data: updateData });
        toast.success('Personnel record updated');
      }
      closeModals();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  if (usersLoading || rolesLoading) {
    return (
      <div className="max-w-[1800px] mx-auto space-y-8 p-6 lg:p-12 pb-24">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-4 w-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-xl" />
          </div>
        </div>
        <UsersSkeleton />
      </div>
    );
  }

  return (
    <Guard requiredPermissions={['admin:access']}>
      <div className="max-w-[1800px] mx-auto space-y-8 p-6 lg:p-12 pb-24">
        {/* Tactical Header */}
        <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-center">
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">
                  Personnel Directory
                </h1>
                <div className="flex items-center gap-2">
                  <Activity size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-muted-foreground/60 dark:text-muted uppercase tracking-[0.2em]">
                    Directory Sync: ACTIVE
                  </span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground/70 dark:text-muted/60 text-[11px] font-medium tracking-wide ml-16">
              Global roster of authorized tactical operators and administrators.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="group relative px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={16} /> Create User
          </button>
        </div>

        {/* Table UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#050508]/40 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl dark:shadow-none"
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black text-muted-foreground/60 dark:text-muted uppercase tracking-[0.2em]">
                  <th className="py-6 px-8">Operator Profile</th>
                  <th className="py-6 px-8">Authorization Level</th>
                  <th className="py-6 px-8">Service Entry</th>
                  <th className="py-6 px-8 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/2 dark:divide-white/2">
                {users?.map((user) => (
                  <tr key={user.id} className="group hover:bg-indigo-500/3 transition-all">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0f] rounded-full" />
                        </div>
                        <div>
                          <button
                            onClick={() => openView(user)}
                            className="text-sm font-black text-foreground dark:text-white uppercase italic hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left block"
                          >
                            {user.name}
                          </button>
                          <p className="text-[10px] text-muted-foreground dark:text-muted font-mono opacity-50">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      {user.globalRole ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                          <Shield size={10} /> {user.globalRole.name}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground dark:text-muted italic opacity-40 uppercase tracking-widest">
                          Restricted Access
                        </span>
                      )}
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-foreground dark:text-white/70 uppercase">
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[8px] text-muted-foreground dark:text-muted uppercase tracking-tighter">
                          System Initialized
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(user)}
                          className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border border-black/5 dark:border-white/5 rounded-xl text-muted-foreground dark:text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
                          title="View Personnel Data"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border border-black/5 dark:border-white/5 rounded-xl text-muted-foreground dark:text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
                          title="Modify Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            const result = await showConfirm(
                              `Purge "${user.name}"?`,
                              'This will permanently remove the personnel record from the system.',
                              'Yes, purge'
                            );
                            if (result.isConfirmed) {
                              try {
                                await deleteMutation.mutateAsync(user.id);
                                showAlert(
                                  'Purged',
                                  'Personnel record removed successfully.',
                                  'success'
                                );
                              } catch (err: any) {
                                showAlert(
                                  'Aborted',
                                  'Purge failed: System protection active.',
                                  'error'
                                );
                              }
                            }
                          }}
                          className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-600/20 border border-black/5 dark:border-white/5 rounded-xl text-muted-foreground dark:text-muted hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95"
                          title="Deauthorize Personnel"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modals System */}
        <AnimatePresence>
          {modalMode && (
            <Portal>
              <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeModals}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {modalMode === 'view' && selectedUser ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-[#0a0a0f] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg relative z-110 shadow-3xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <button
                      onClick={closeModals}
                      className="absolute top-6 right-6 p-2 text-muted hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>

                    <div className="flex flex-col items-center mb-10">
                      <div className="w-24 h-24 rounded-4xl bg-indigo-600/10 border border-indigo-500/40 flex items-center justify-center text-3xl font-black text-indigo-500 mb-4 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tight">
                        {selectedUser.name}
                      </h2>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">
                        <Shield size={12} /> {selectedUser.globalRole?.name || 'Authorized Member'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-2xl group transition-all">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 flex items-center justify-center text-muted group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          <Mail size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mb-1">
                            Authorization Email
                          </p>
                          <p className="text-sm font-bold text-foreground dark:text-white">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-2xl group transition-all">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 flex items-center justify-center text-muted group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mb-1">
                            Service Initiation
                          </p>
                          <p className="text-sm font-bold text-foreground dark:text-white">
                            {new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                              dateStyle: 'long',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-2xl group transition-all">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 flex items-center justify-center text-muted group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          <Fingerprint size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black text-muted uppercase tracking-widest leading-none mb-1">
                            Matrix Identifier
                          </p>
                          <p className="text-[10px] font-mono text-muted group-hover:text-indigo-400/60 transition-colors uppercase">
                            {selectedUser.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex gap-4">
                      <button
                        onClick={closeModals}
                        className="flex-1 px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-muted-foreground dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                      >
                        Close Case
                      </button>
                      <button
                        onClick={() => openEdit(selectedUser)}
                        className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <Edit2 size={14} /> Update Record
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-[#0a0a0f] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg relative z-110 shadow-3xl"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <button
                      onClick={closeModals}
                      className="absolute top-6 right-6 p-2 text-muted hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>

                    <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic mb-8 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/40 text-indigo-500">
                        {modalMode === 'create' ? <Plus size={20} /> : <Edit2 size={20} />}
                      </div>
                      {modalMode === 'create' ? 'Personnel Enlistment' : 'Record Calibration'}
                    </h2>

                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                          <AtSign size={10} /> Designation (Full Name)
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground dark:text-white placeholder:text-muted/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="Operator Name"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                            <Mail size={10} /> Auth Email
                          </label>
                          <input
                            type="email"
                            required
                            disabled={modalMode === 'edit'}
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground dark:text-white placeholder:text-muted/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            placeholder="email@tactical.node"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                          <KeyRound size={10} />{' '}
                          {modalMode === 'create'
                            ? 'Access Key (Password)'
                            : 'Override Key (Leave blank to keep current)'}
                        </label>
                        <input
                          type="password"
                          required={modalMode === 'create'}
                          minLength={6}
                          value={form.password}
                          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground dark:text-white placeholder:text-muted/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                          <Shield size={10} /> Clearance Level (Global Role)
                        </label>
                        <select
                          value={form.globalRoleId}
                          onChange={(e) => setForm((f) => ({ ...f, globalRoleId: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-foreground dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-[#0a0a0f] text-foreground dark:text-white"
                          >
                            NO CLEARANCE
                          </option>
                          {roles?.map((role) => (
                            <option
                              key={role.id}
                              value={role.id}
                              className="bg-white dark:bg-[#0a0a0f] text-foreground dark:text-white lowercase first-letter:uppercase"
                            >
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-4 mt-6 pt-6 border-t border-black/5 dark:border-white/5">
                        <button
                          type="button"
                          onClick={closeModals}
                          className="flex-1 px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-muted-foreground dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Abort
                        </button>
                        <button
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {createMutation.isPending || updateMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {modalMode === 'create' ? 'Commit Authorization' : 'Save Calibrations'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </Guard>
  );
}
