import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intercomService, CreateCommandTemplateDto } from '../api/intercom.service';

export const useIntercomTemplates = (productionId?: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['intercom-templates', productionId],
        queryFn: () => (productionId ? intercomService.getTemplates(productionId) : Promise.resolve([])),
        enabled: !!productionId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCommandTemplateDto) =>
            intercomService.createTemplate(productionId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intercom-templates', productionId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateCommandTemplateDto }) =>
            intercomService.updateTemplate(productionId!, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intercom-templates', productionId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => intercomService.deleteTemplate(productionId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intercom-templates', productionId] });
        },
    });

    return {
        templates: query.data || [],
        isLoading: query.isLoading,
        createTemplate: createMutation.mutateAsync,
        updateTemplate: updateMutation.mutateAsync,
        deleteTemplate: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};
