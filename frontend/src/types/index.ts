export interface BaseResponse {
  message: string;
  statusCode: number;
  success: boolean;
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

export interface RegisterFormData {
  email: string;
  password: string;
  fullname: string;
  avatar?: File | null;
}

export type RegisterResponse = BaseResponse & {
  data: User;
};

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

export type LoginResponse = BaseResponse & {
  data: null;
};

export type UserProfile = BaseResponse & {
  data: User;
};

export type LogoutResponse = BaseResponse & {
  data: null;
};

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  status: "expired" | "active";
  current: boolean;
}

export type SessionListResponse = BaseResponse & {
  data: Session[];
};
