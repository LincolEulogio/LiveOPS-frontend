export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  globalRole?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
