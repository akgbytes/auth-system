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

export type LoginResponse = BaseResponse & {
  data: {
    refreshToken: string;
    accessToken: string;
  };
};

export type LogoutResponse = BaseResponse & {
  data: null;
};

export interface SessionListResponse {}
