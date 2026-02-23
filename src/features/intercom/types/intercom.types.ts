export interface IntercomTemplate {
    id: string;
    productionId?: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    createdAt?: string;
    updatedAt?: string;
    // UI extension fields
    isChat?: boolean;
    targetUserId?: string;
}

export interface CreateCommandTemplateDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface CrewMember {
    userId: string;
    userName: string;
    roleName: string;
    isOnline: boolean;
    currentStatus?: string;
    lastAck?: {
        message: string;
        timestamp: string;
        type: string;
    };
}
