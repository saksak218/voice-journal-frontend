// types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
    adminToken?: string;
  };
  message?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
