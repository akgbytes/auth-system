import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_URL, AUTH_PATH, ADMIN_PATH } from "../../constants";
import type {
  LoginFormData,
  ResetPasswordFormData,
  ApiResponse,
  ResendVerificationFormData,
  ForgotPasswordFormData,
  Session,
  User,
} from "@/types";
import { logout } from "../features/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

// const baseQueryWithReauth = (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);
//   if(result.error?.status)
// };

export const apiSlice = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<User>, FormData>({
      query: (formData) => ({
        url: `${AUTH_PATH}/register`,
        method: "POST",
        body: formData,
      }),
    }),

    login: builder.mutation<ApiResponse<null>, LoginFormData>({
      query: (credentials) => ({
        url: `${AUTH_PATH}/login`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    googleLogin: builder.mutation<
      ApiResponse<null>,
      { token: string; rememberMe?: boolean }
    >({
      query: (data) => ({
        url: `${AUTH_PATH}/login/google`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    verifyEmail: builder.query<ApiResponse<null>, string>({
      query: (token) => ({
        url: `${AUTH_PATH}/verify/${token}`,
        method: "GET",
      }),
    }),

    resendVerification: builder.mutation<
      ApiResponse<null>,
      ResendVerificationFormData
    >({
      query: (data) => ({
        url: `${AUTH_PATH}/email/resend`,
        method: "POST",
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPasswordFormData>(
      {
        query: (data) => ({
          url: `${AUTH_PATH}/password/forgot`,
          method: "POST",
          body: data,
        }),
      }
    ),

    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordFormData>({
      query: ({ token, password, confirmPassword }) => ({
        url: `${AUTH_PATH}/password/reset/${token}`,
        method: "POST",
        body: { password, confirmPassword },
      }),
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: `${AUTH_PATH}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    logoutAll: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: `${AUTH_PATH}/logout/all`,
        method: "POST",
      }),
    }),

    logoutSpecificSession: builder.mutation<ApiResponse<null>, { id: string }>({
      query: ({ id }) => {
        console.log("id recie", id);

        return {
          url: `${AUTH_PATH}/sessions/${id}`,
          method: "POST",
        };
      },
    }),

    fetchUserSessions: builder.query<ApiResponse<Session[]>, void>({
      query: () => ({
        url: `${AUTH_PATH}/sessions`,
        method: "GET",
      }),
    }),

    deleteSession: builder.mutation<ApiResponse<null>, string>({
      query: (sessionId) => ({
        url: `${AUTH_PATH}/sessions/${sessionId}`,
        method: "DELETE",
      }),
    }),

    fetchUser: builder.query<ApiResponse<User>, void>({
      query: () => `${AUTH_PATH}/profile`,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useGoogleLoginMutation,
  useVerifyEmailQuery,
  useLoginMutation,
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useResendVerificationMutation,
  useDeleteSessionMutation,
  useForgotPasswordMutation,
  useFetchUserSessionsQuery,
  useLogoutAllMutation,
  useLogoutMutation,
  useLogoutSpecificSessionMutation,
  useResetPasswordMutation,
} = apiSlice;
