export enum CommandStatus {
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
}

export interface CommandTemplate {
    id: string;
    productionId: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CommandResponse {
    id: string;
    commandId: string;
    responderId: string;
    response: string;
    note: string | null;
    createdAt: string;
    responder?: {
        id: string;
        name: string;
    };
}

export interface Command {
    id: string;
    productionId: string;
    senderId: string;
    targetRoleId: string | null;
    templateId: string | null;
    message: string;
    requiresAck: boolean;
    status: CommandStatus;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
    };
    targetRole?: {
        id: string;
        name: string;
    };
    template?: CommandTemplate;
    responses?: CommandResponse[];
}

export interface SendCommandDto {
    productionId: string;
    senderId: string;
    targetRoleId?: string;
    templateId?: string;
    message: string;
    requiresAck?: boolean;
}

export interface AckCommandDto {
    commandId: string;
    responderId: string;
    response: string;
    note?: string;
    productionId: string;
}

export interface ChatMessage {
    id: string;
    productionId: string;
    userId: string;
    message: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
    };
}

export interface SendChatMessageDto {
    productionId: string;
    userId: string;
    message: string;
}
