'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProduction, useAssignUser, useRemoveUser } from '@/features/productions/hooks/useProductions';
import { useUsers, useRoles } from '@/features/users/hooks/useUsers';
import { ArrowLeft, Loader2, UserPlus, UserMinus, Shield, User, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeamManagementPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: production, isLoading: prodLoading, error: fetchError } = useProduction(id);
    const { data: users, isLoading: usersLoading } = useUsers();

    const assignMutation = useAssignUser();
    const removeMutation = useRemoveUser();

    const isLoading = prodLoading || usersLoading;

    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            setError(null);
            const user = users?.find(u => u.email === email);
            const roleName = user?.globalRole?.name || 'VIEWER';

            await assignMutation.mutateAsync({ id, email, roleName });
            setEmail('');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to assign user');
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user from the production?')) return;

        try {
            setError(null);
            await removeMutation.mutateAsync({ id, userId });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to remove user');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-muted animate-pulse">Loading team data...</p>
            </div>
        );
    }

    if (fetchError || !production) {
        return (
            <div className="bg-red-500/10 text-red-400 p-6 rounded-xl border border-red-500/20 max-w-2xl mx-auto mt-8 flex flex-col items-center text-center">
                <AlertCircle size={48} className="mb-4 opacity-80" />
                <h2 className="text-xl font-bold mb-2">Error Loading Team</h2>
                <p className="mb-6">We couldn't retrieve the team information for this production.</p>
                <Link href={`/productions/${id}`} className="px-4 py-2 bg-background border border-card-border text-foreground rounded hover:bg-card-bg transition-colors">
                    Back to Production
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6">
            {/* Header */}
            <div>
                <Link
                    href={`/productions/${id}`}
                    className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm font-medium mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to {production.name}
                </Link>
                <h1 className="text-3xl font-bold text-foreground ">Team Management</h1>
                <p className="text-muted mt-2">Manage access and roles for this production environment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assignment Form */}
                <div className="lg:col-span-1">
                    <div className="bg-card-bg border border-card-border rounded-2xl p-6 sticky top-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <UserPlus size={20} className="text-indigo-400" />
                            Add Member
                        </h2>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-xs flex gap-2">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase  mb-1.5">User Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-muted" size={16} />
                                    <select
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-background border border-card-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Select a user</option>
                                        {users?.map(u => (
                                            <option key={u.id} value={u.email}>
                                                {u.name || u.email} {u.globalRole ? `(${u.globalRole.name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Role selector removed - using global roles */}

                            <button
                                type="submit"
                                disabled={assignMutation.isPending || !email}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-600/20 mt-2"
                            >
                                {assignMutation.isPending ? 'Assigning...' : 'Add to Team'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Member List */}
                <div className="lg:col-span-2">
                    <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-card-border">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Shield size={20} className="text-indigo-400" />
                                Active Members
                                <span className="ml-2 px-2 py-0.5 bg-background border border-card-border rounded text-xs text-muted font-normal">
                                    {(production as any).users?.length || 0}
                                </span>
                            </h2>
                        </div>

                        <ul className="divide-y divide-card-border/50">
                            {((production as any).users || []).map((prodUser: any) => (
                                <li key={prodUser.userId} className="p-4 hover:bg-card-border/30 transition-colors flex flex-col gap-4 md:flex-row md:items-center justify-between group">
                                    <div className="flex  items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-background border border-card-border flex items-center justify-center text-muted">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-medium text-sm">{prodUser.user.name || 'Unnamed User'}</h4>
                                            <p className="text-xs text-muted">{prodUser.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="px-2.5 py-1 bg-background border border-card-border rounded-md text-[10px] font-bold uppercase  text-indigo-400">
                                            {prodUser.role.name}
                                        </span>

                                        {/* Don't allow removing yourself if you are an admin or simply provide a way to remove others */}
                                        <button
                                            onClick={() => handleRemove(prodUser.userId)}
                                            disabled={removeMutation.isPending}
                                            className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                            title="Remove member"
                                        >
                                            <UserMinus size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}

                            {(!(production as any).users || (production as any).users.length === 0) && (
                                <li className="p-12 text-center text-muted">
                                    <p>No members assigned to this production yet.</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
