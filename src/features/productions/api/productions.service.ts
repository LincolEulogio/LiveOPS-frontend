import { apiClient } from '@/shared/api/api.client';
import {
  Production,
  CreateProductionDto,
  UpdateProductionDto,
  ProductionListResponse,
} from '@/features/productions/types/production.types';

export const productionsService = {
  async getProductions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ProductionListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    return apiClient.get(`/productions?${searchParams.toString()}`);
  },

  async getProduction(id: string): Promise<Production> {
    return apiClient.get(`/productions/${id}`);
  },

  async createProduction(data: CreateProductionDto): Promise<Production> {
    return apiClient.post('/productions', data);
  },

  async updateProduction(id: string, data: UpdateProductionDto): Promise<Production> {
    return apiClient.patch(`/productions/${id}`, data);
  },

  async deleteProduction(id: string): Promise<void> {
    return apiClient.delete(`/productions/${id}`);
  },

  async assignUser(id: string, email: string, roleName: string): Promise<any> {
    return apiClient.post(`/productions/${id}/users`, { email, roleName });
  },

  async removeUser(id: string, userId: string): Promise<void> {
    return apiClient.delete(`/productions/${id}/users/${userId}`);
  },
};
