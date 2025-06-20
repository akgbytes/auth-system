import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { BASE_URL, AUTH_PATH, ADMIN_PATH } from "../../constants";
import type {
  LoginFormData,
  ResetPasswordFormData,
  ApiResponse,
  ResendVerificationFormData,
  ForgotPasswordFormData,
  Session,
  User,
  AllUsers,
} from "@/types";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<any, any, any> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);
  if (
    result.error?.status === 401 &&
    (result.error.data as { message?: string })?.message === "TokenExpiredError"
  ) {
    await baseQuery(`${AUTH_PATH}/refresh-token`, api, extraOptions);
    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth as BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  >,
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
      query: ({ id }) => ({
        url: `${AUTH_PATH}/sessions/${id}`,
        method: "POST",
      }),
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

    fetchAllUsers: builder.query<ApiResponse<AllUsers[]>, void>({
      query: () => `${ADMIN_PATH}/users`,
    }),

    fetchUserSession: builder.query<ApiResponse<Session[]>, { id: string }>({
      query: ({ id }) => `${ADMIN_PATH}/users/${id}`,
    }),

    logoutUserSession: builder.mutation<ApiResponse<null>, { id: string }>({
      query: ({ id }) => ({
        url: `${ADMIN_PATH}/users/session/${id}`,
        method: "POST",
      }),
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
  useLogoutUserSessionMutation,
  useFetchAllUsersQuery,
  useLazyFetchUserSessionQuery,
} = apiSlice;
