import { PermissionAssignment } from '@/features/users/types/user.types';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  globalRole?: {
    id: string;
    name: string;
    permissions?: PermissionAssignment[];
  };
  role?: {
    id: string;
    name: string;
    permissions: PermissionAssignment[];
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
