export enum TimelineBlockStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}

export interface TimelineBlock {
    id: string;
    productionId: string;
    title: string;
    description: string | null;
    durationMs: number;
    order: number;
    status: TimelineBlockStatus;
    startTime: string | null;
    endTime: string | null;
    linkedScene: string | null;
    intercomTemplateId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTimelineBlockDto {
    title: string;
    description?: string;
    durationMs?: number;
    order?: number;
    linkedScene?: string;
    intercomTemplateId?: string;
}

export interface UpdateTimelineBlockDto extends Partial<CreateTimelineBlockDto> { }

export interface ReorderBlocksDto {
    blockIds: string[];
}
