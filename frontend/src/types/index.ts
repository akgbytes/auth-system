export interface BaseResponse {
  message: string;
  statusCode: number;
  success: boolean;
}

export interface ApiResponse<T> extends BaseResponse {
  data: T;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  avatar: string | null;
  role: "admin" | "user";
  provider: "local" | "google";
  isVerified: boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  status: "expired" | "active";
  current?: boolean;
}

export interface AllUsers {
  id: string;
  fullname: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "expired";
  lastActive: string;
  sessionsCount: number;
}

// FormData Types

export interface RegisterFormData {
  email: string;
  password: string;
  fullname: string;
  avatar?: File | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ResendVerificationFormData {
  email: string;
}
export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// API Request n Response Types
