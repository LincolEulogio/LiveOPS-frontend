import { IntercomTemplate } from '../../intercom/types/intercom.types';

export enum TimelineStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED'
}

export interface TimelineBlock {
    id: string;
    productionId: string;
    title: string;
    description?: string;
    source?: string;
    notes?: string;
    durationMs?: number;
    order: number;
    status: TimelineStatus;
    startTime?: string;
    endTime?: string;
    linkedScene?: string;
    intercomTemplateId?: string;
    intercomTemplate?: IntercomTemplate;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTimelineBlockDto {
    title: string;
    description?: string;
    source?: string;
    notes?: string;
    durationMs?: number;
    order?: number;
    linkedScene?: string;
    intercomTemplateId?: string;
}

export interface UpdateTimelineBlockDto extends Partial<CreateTimelineBlockDto> { }

export interface ReorderBlocksDto {
    blockIds: string[];
}
