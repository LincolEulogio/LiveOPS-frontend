export interface User {
  id: string;
  email: string;
  name: string | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
