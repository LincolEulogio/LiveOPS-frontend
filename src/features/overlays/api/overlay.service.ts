import { apiClient } from '@/shared/api/api.client';
import { OverlayTemplate, CreateOverlayDto } from '../types/overlay.types';

export const overlayService = {
    getOverlays: (productionId: string): Promise<OverlayTemplate[]> =>
        apiClient.get(`/productions/${productionId}/overlays`),

    getOverlay: (productionId: string, id: string): Promise<OverlayTemplate> =>
        apiClient.get(`/productions/${productionId}/overlays/${id}`),

    createOverlay: (productionId: string, dto: CreateOverlayDto): Promise<OverlayTemplate> =>
        apiClient.post(`/productions/${productionId}/overlays`, dto),

    updateOverlay: (productionId: string, id: string, dto: Partial<CreateOverlayDto>): Promise<OverlayTemplate> =>
        apiClient.patch(`/productions/${productionId}/overlays/${id}`, dto),

    deleteOverlay: (productionId: string, id: string): Promise<void> =>
        apiClient.delete(`/productions/${productionId}/overlays/${id}`),

    toggleActive: (productionId: string, id: string, isActive: boolean): Promise<OverlayTemplate> =>
        apiClient.patch(`/productions/${productionId}/overlays/${id}/toggle`, { isActive }),
};
