import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api.client';

export interface Webhook {
    id: string;
    productionId: string;
    name: string;
    url: string;
    platform: 'DISCORD' | 'SLACK' | 'GENERIC';
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useWebhooks = (productionId: string) => {
    const queryClient = useQueryClient();
    const baseKey = ['webhooks', productionId];

    const { data: webhooks = [], isLoading } = useQuery<Webhook[]>({
        queryKey: baseKey,
        queryFn: async () => {
            return apiClient.get<Webhook[]>(`/productions/${productionId}/webhooks`);
        },
        enabled: !!productionId,
    });

    const createWebhook = useMutation({
        mutationFn: async (data: { name: string; url: string; platform: string }) => {
            return apiClient.post(`/productions/${productionId}/webhooks`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: baseKey });
        },
    });

    const updateWebhook = useMutation({
        mutationFn: async ({ id, ...data }: { id: string; name?: string; url?: string; isEnabled?: boolean }) => {
            return apiClient.patch(`/productions/${productionId}/webhooks/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: baseKey });
        },
    });

    const deleteWebhook = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.delete(`/productions/${productionId}/webhooks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: baseKey });
        },
    });

    const testWebhook = useMutation({
        mutationFn: async (id: string) => {
            return apiClient.post(`/productions/${productionId}/webhooks/${id}/test`, {});
        },
    });

    return {
        webhooks,
        isLoading,
        createWebhook,
        updateWebhook,
        deleteWebhook,
        testWebhook,
    };
};
