export interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions?: any[];
}
