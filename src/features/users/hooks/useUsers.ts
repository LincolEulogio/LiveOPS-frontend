import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { User, Role } from '@/features/users/types/user.types';

export interface CreateUserPayload {
    email: string;
    password?: string;
    name?: string;
    globalRoleId?: string | null;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> { }

// Users
export function useUsers() {
    return useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            return await apiClient.get('/users');
        }
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateUserPayload) => {
            return await apiClient.post<User>('/users', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateUserPayload }) => {
            return await apiClient.patch<User>(`/users/${id}`, data);
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['users'] });
            const previousUsers = queryClient.getQueryData<User[]>(['users']);
            queryClient.setQueryData<User[]>(['users'], old =>
                old?.map(u => u.id === id ? {
                    ...u,
                    ...data,
                    globalRoleId: data.globalRoleId === null ? undefined : (data.globalRoleId || u.globalRoleId)
                } : u)
            );
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.delete(`/users/${id}`);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['users'] });
            const previousUsers = queryClient.getQueryData<User[]>(['users']);
            queryClient.setQueryData<User[]>(['users'], old =>
                old?.filter(u => u.id !== id)
            );
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            if (context?.previousUsers) {
                queryClient.setQueryData(['users'], context.previousUsers);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

// Roles
export function useRoles() {
    return useQuery<Role[]>({
        queryKey: ['roles'],
        queryFn: async () => {
            return await apiClient.get('/users/roles');
        }
    });
}

// Permissions
export function usePermissions() {
    return useQuery<{ id: string; action: string; description?: string }[]>({
        queryKey: ['permissions'],
        queryFn: async () => {
            return await apiClient.get('/users/permissions');
        }
    });
}

export function useUpdateRolePermissions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
            return await apiClient.post(`/users/roles/${roleId}/permissions`, { permissionIds });
        },
        onMutate: async ({ roleId, permissionIds }) => {
            await queryClient.cancelQueries({ queryKey: ['roles'] });
            await queryClient.cancelQueries({ queryKey: ['permissions'] });

            const previousRoles = queryClient.getQueryData<Role[]>(['roles']);
            const permissions = queryClient.getQueryData<{ id: string; action: string; description?: string }[]>(['permissions']);

            queryClient.setQueryData<Role[]>(['roles'], old =>
                old?.map(role => {
                    if (role.id === roleId) {
                        return {
                            ...role,
                            permissions: permissionIds.map(id => {
                                const permDef = permissions?.find(p => p.id === id);
                                return {
                                    permissionId: id,
                                    permission: {
                                        id,
                                        action: permDef?.action || 'UNKNOWN',
                                        resource: 'UNKNOWN'
                                    }
                                };
                            })
                        };
                    }
                    return role;
                })
            );
            return { previousRoles };
        },
        onError: (err, variables, context) => {
            if (context?.previousRoles) {
                queryClient.setQueryData(['roles'], context.previousRoles);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
}

export function useCreateRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; description?: string }) => {
            return await apiClient.post('/users/roles', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
}

export function useUpdateRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name?: string; description?: string } }) => {
            return await apiClient.patch(`/users/roles/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
}

export function useDeleteRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await apiClient.delete(`/users/roles/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
}
