export interface Permission {
    id: string;
    action: string;
    resource: string;
}

export interface PermissionAssignment {
    permissionId: string;
    permission: Permission;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    updatedAt?: string;
    globalRoleId?: string;
    globalRole?: { name: string };
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions?: PermissionAssignment[];
}
