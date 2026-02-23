import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streamingService } from '../api/streaming.service';
import { StreamingDestination } from '../types/streaming.types';
import { toast } from 'sonner';

export const useStreamingDestinations = (productionId: string | undefined) => {
    const queryClient = useQueryClient();

    const { data: destinations = [], isLoading, error } = useQuery({
        queryKey: ['streaming-destinations', productionId],
        queryFn: () => streamingService.getDestinations(productionId!),
        enabled: !!productionId,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => streamingService.createDestination(productionId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['streaming-destinations', productionId] });
            toast.success('Destination added successfully');
        },
        onError: (err: any) => {
            toast.error(`Failed to add destination: ${err.message}`);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => streamingService.updateDestination(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['streaming-destinations', productionId] });
            toast.success('Destination updated');
        },
        onError: (err: any) => {
            toast.error(`Failed to update destination: ${err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => streamingService.deleteDestination(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['streaming-destinations', productionId] });
            toast.success('Destination removed');
        },
        onError: (err: any) => {
            toast.error(`Failed to remove destination: ${err.message}`);
        }
    });

    return {
        destinations,
        isLoading,
        error,
        createDestination: createMutation.mutateAsync,
        updateDestination: updateMutation.mutateAsync,
        deleteDestination: deleteMutation.mutateAsync,
        isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};
