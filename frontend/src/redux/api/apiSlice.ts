import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_URL, AUTH_URL } from "../../constants";
import type {
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  RegisterResponse,
  LogoutResponse,
  BaseResponse,
  SessionListResponse,
  User,
} from "@/types";

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL, credentials: "include" });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, FormData>({
      query: (data) => ({
        url: `${AUTH_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginFormData>({
      query: (data) => ({
        url: `${AUTH_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.query<BaseResponse, string>({
      query: (token) => ({
        url: `${AUTH_URL}/verify/${token}`,
        method: "GET",
      }),
    }),

    resendVerificationEmail: builder.mutation<BaseResponse, { email: string }>({
      query: (data) => ({
        url: "email/resend",
        method: "POST",
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<BaseResponse, { email: string }>({
      query: (data) => ({
        url: "/password/forgot",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      BaseResponse,
      { token: string; password: string }
    >({
      query: ({ token, password }) => ({
        url: `/password/reset/${token}`,
        method: "POST",
        body: { password },
      }),
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: "POST",
      }),
    }),

    logoutAll: builder.mutation<BaseResponse, void>({
      query: () => ({
        url: "/logout/all",
        method: "POST",
      }),
    }),

    getSessions: builder.query<SessionListResponse, void>({
      query: () => ({
        url: "/sessions",
        method: "GET",
      }),
    }),

    deleteSession: builder.mutation<BaseResponse, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}`,
        method: "DELETE",
      }),
    }),

    googleLogin: builder.mutation<LoginResponse, { token: string }>({
      query: (data) => ({
        url: "/login/google",
        method: "POST",
        body: data,
      }),
    }),

    getProfile: builder.query<User, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useRegisterMutation, useGoogleLoginMutation } = apiSlice;
