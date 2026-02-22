import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionsService } from '../api/productions.service';
import { CreateProductionDto, UpdateProductionDto } from '../types/production.types';

export const useProductions = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['productions', params],
    queryFn: () => productionsService.getProductions(params),
  });
};

export const useProduction = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['productions', id],
    queryFn: () => productionsService.getProduction(id),
    enabled: !!id && enabled,
  });
};

export const useCreateProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductionDto) => productionsService.createProduction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
};

export const useUpdateProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductionDto }) =>
      productionsService.updateProduction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      queryClient.invalidateQueries({ queryKey: ['productions', variables.id] });
    },
  });
};

export const useDeleteProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productionsService.deleteProduction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
};

export const useAssignUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, email, roleName }: { id: string; email: string; roleName: string }) =>
      productionsService.assignUser(id, email, roleName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productions', variables.id] });
    },
  });
};

export const useRemoveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      productionsService.removeUser(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productions', variables.id] });
    },
  });
};
