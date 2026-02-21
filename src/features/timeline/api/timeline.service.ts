import { apiClient } from '@/shared/api/api.client';
import {
    TimelineBlock,
    CreateTimelineBlockDto,
    UpdateTimelineBlockDto,
    ReorderBlocksDto,
} from '../types/timeline.types';

export const timelineService = {
    getBlocks: (productionId: string): Promise<TimelineBlock[]> =>
        apiClient.get(`/productions/${productionId}/timeline`),

    createBlock: (productionId: string, dto: CreateTimelineBlockDto): Promise<TimelineBlock> =>
        apiClient.post(`/productions/${productionId}/timeline`, dto),

    updateBlock: (
        productionId: string,
        id: string,
        dto: UpdateTimelineBlockDto
    ): Promise<TimelineBlock> =>
        apiClient.put(`/productions/${productionId}/timeline/${id}`, dto),

    deleteBlock: (productionId: string, id: string): Promise<{ success: boolean }> =>
        apiClient.delete(`/productions/${productionId}/timeline/${id}`),

    reorderBlocks: (productionId: string, blockIds: string[]): Promise<{ success: boolean }> =>
        apiClient.put(`/productions/${productionId}/timeline/reorder`, { blockIds }),

    startBlock: (productionId: string, id: string): Promise<TimelineBlock> =>
        apiClient.post(`/productions/${productionId}/timeline/${id}/start`),

    completeBlock: (productionId: string, id: string): Promise<TimelineBlock> =>
        apiClient.post(`/productions/${productionId}/timeline/${id}/complete`),

    resetBlock: (productionId: string, id: string): Promise<TimelineBlock> =>
        apiClient.post(`/productions/${productionId}/timeline/${id}/reset`),
};
