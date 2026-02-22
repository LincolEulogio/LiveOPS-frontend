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
        createTemplate: async (data: CreateCommandTemplateDto) => {
            if (!productionId) {
                console.error('[useIntercomTemplates] Cannot create template: productionId is missing');
                throw new Error('No production ID provided');
            }
            console.log(`[useIntercomTemplates] Creating template for production: ${productionId}`);
            const res = await createMutation.mutateAsync(data);
            console.log(`[useIntercomTemplates] Template created, invalidating query: ['intercom-templates', ${productionId}]`);
            return res;
        },
        updateTemplate: async (args: { id: string; data: CreateCommandTemplateDto }) => {
            if (!productionId) {
                console.error('[useIntercomTemplates] Cannot update template: productionId is missing');
                throw new Error('No production ID provided');
            }
            const res = await updateMutation.mutateAsync(args);
            console.log(`[useIntercomTemplates] Template updated, invalidating query: ['intercom-templates', ${productionId}]`);
            return res;
        },
        deleteTemplate: async (id: string) => {
            if (!productionId) {
                console.error('[useIntercomTemplates] Cannot delete template: productionId is missing');
                throw new Error('No production ID provided');
            }
            const res = await deleteMutation.mutateAsync(id);
            console.log(`[useIntercomTemplates] Template deleted, invalidating query: ['intercom-templates', ${productionId}]`);
            return res;
        },
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        refetch: query.refetch,
    };
};
