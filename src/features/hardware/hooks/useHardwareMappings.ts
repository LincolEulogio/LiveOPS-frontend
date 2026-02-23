import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hardwareService, HardwareMapping } from '../api/hardware.service';

export const useHardwareMappings = (productionId?: string) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['hardware-mappings', productionId],
        queryFn: () => (productionId ? hardwareService.getMappings(productionId) : Promise.resolve([])),
        enabled: !!productionId,
    });

    const saveMutation = useMutation({
        mutationFn: ({ mapKey, ruleId }: { mapKey: string; ruleId: string }) =>
            hardwareService.saveMapping(productionId!, mapKey, ruleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hardware-mappings', productionId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (mapKey: string) =>
            hardwareService.deleteMapping(productionId!, mapKey),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hardware-mappings', productionId] });
        },
    });

    return {
        mappings: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        saveMapping: saveMutation.mutateAsync,
        deleteMapping: deleteMutation.mutateAsync,
        isMutating: saveMutation.isPending || deleteMutation.isPending,
    };
};
