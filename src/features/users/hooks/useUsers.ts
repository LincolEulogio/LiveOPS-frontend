import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';
import { User, Role } from '../types/user.types';

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
        mutationFn: async (data: any) => {
            return await apiClient.post('/users', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return await apiClient.patch(`/users/${id}`, data);
        },
        onSuccess: () => {
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
        onSuccess: () => {
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
    return useQuery<any[]>({
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        }
    });
}
