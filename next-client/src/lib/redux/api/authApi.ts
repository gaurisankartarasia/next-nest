import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import {
  logout,
  setCredentials,
  updateAccessToken,
  type User,
} from "../slices/authSlice";

export type { User };

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface CaptchaResponse {
  captchaId: string;
  image: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  captchaId?: string;
  captchaCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role?: string;
  status?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserStatusRequest {
  id: string;
  status: string;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql",
  credentials: "include", // Essential: sends and receives httpOnly cookies across origins
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    return result;
  }

  const rawData = result.data as
    | {
        data?: any;
        errors?: Array<{ extensions?: { code?: string }; message?: string }>;
      }
    | undefined;

  const isUnauthorized = Boolean(
    rawData?.errors?.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.message?.toLowerCase().includes("unauthorized") ||
        e.message?.toLowerCase().includes("no refresh token"),
    ),
  );

  const isAuthMutation =
    typeof args === "object" &&
    args.body &&
    (JSON.stringify(args.body).includes("mutation Login") ||
      JSON.stringify(args.body).includes("mutation Register"));

  const isRefreshCall =
    typeof args === "object" &&
    args.body &&
    JSON.stringify(args.body).includes("refreshToken");

  if (isUnauthorized && !isRefreshCall && !isAuthMutation) {
    const refreshResult = await rawBaseQuery(
      {
        url: "",
        method: "POST",
        body: {
          query: `
            mutation RefreshToken {
              refreshToken {
                accessToken
                user {
                  id
                  email
                  name
                  role
                  createdAt
                  updatedAt
                }
              }
            }
          `,
        },
      },
      api,
      extraOptions,
    );

    const refreshData = refreshResult.data as
      | { data?: { refreshToken?: any }; errors?: any[] }
      | undefined;

    if (refreshData?.data?.refreshToken) {
      const { accessToken, user } = refreshData.data.refreshToken;
      api.dispatch(setCredentials({ accessToken, user }));
      // Retry original request with the new access token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
      return {
        error: {
          status: "CUSTOM_ERROR",
          error:
            rawData?.errors?.[0]?.message ||
            "Unauthorized",
          data: rawData?.errors,
        },
      };
    }
  }

  // Check final result for GraphQL errors and convert them to RTK Query errors
  const finalData = result.data as
    | {
        data?: any;
        errors?: Array<{ extensions?: { code?: string }; message?: string }>;
      }
    | undefined;

  if (finalData?.errors && finalData.errors.length > 0) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: finalData.errors[0]?.message || "GraphQL error",
        data: finalData.errors,
      },
    };
  }

  return result;
};

export interface UsersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
}

export interface PaginatedUsersResult {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Users"],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (input) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                accessToken
                user {
                  id
                  pid
                  email
                  name
                  role
                  status
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: { input },
        },
      }),
      transformResponse: (response: any) => response?.data?.register,
      invalidatesTags: ["User", "Users"],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (input) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                accessToken
                user {
                  id
                  pid
                  email
                  name
                  role
                  status
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: { input },
        },
      }),
      transformResponse: (response: any) => response?.data?.login,
      invalidatesTags: ["User", "Users"],
    }),

    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation RefreshToken {
              refreshToken {
                accessToken
                user {
                  id
                  pid
                  email
                  name
                  role
                  status
                  createdAt
                  updatedAt
                }
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => response?.data?.refreshToken,
    }),

    logoutMutation: builder.mutation<boolean, void>({
      query: () => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation Logout {
              logout
            }
          `,
        },
      }),
      transformResponse: (response: any) => response?.data?.logout,
      invalidatesTags: ["User", "Users"],
    }),

    getCaptcha: builder.query<CaptchaResponse, void>({
      query: () => ({
        url: "",
        method: "POST",
        body: {
          query: `
            query Captcha {
              captcha {
                captchaId
                image
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => response?.data?.captcha,
    }),

    getMe: builder.query<User, void>({
      query: () => ({
        url: "",
        method: "POST",
        body: {
          query: `
            query Me {
              me {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => response?.data?.me,
      providesTags: ["User"],
    }),

    getUsers: builder.query<User[], void>({
      query: () => ({
        url: "",
        method: "POST",
        body: {
          query: `
            query GetUsers {
              users {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
        },
      }),
      transformResponse: (response: any) => response?.data?.users,
      providesTags: ["Users"],
    }),

    getPaginatedUsers: builder.query<
      PaginatedUsersResult,
      UsersQueryParams | void
    >({
      query: (params) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            query GetPaginatedUsers($input: UsersQueryInput) {
              paginatedUsers(input: $input) {
                items {
                  id
                  pid
                  email
                  name
                  role
                  status
                  createdAt
                  updatedAt
                }
                totalCount
                page
                pageSize
                pageCount
              }
            }
          `,
          variables: {
            input: params
              ? {
                  ...params,
                  sortOrder: params.sortOrder
                    ? (params.sortOrder.toUpperCase() as "ASC" | "DESC")
                    : undefined,
                }
              : {},
          },
        },
      }),
      transformResponse: (response: any) =>
        response?.data?.paginatedUsers ?? {
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          pageCount: 1,
        },
      providesTags: ["Users"],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            query GetUserById($id: ID!) {
              user(id: $id) {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
          variables: { id },
        },
      }),
      transformResponse: (response: any) => response?.data?.user,
      providesTags: ["User"],
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      query: (input) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation CreateUser($input: CreateUserInput!) {
              createUser(input: $input) {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input },
        },
      }),
      transformResponse: (response: any) => response?.data?.createUser,
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: (input) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation UpdateUser($input: UpdateUserInput!) {
              updateUser(input: $input) {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input },
        },
      }),
      transformResponse: (response: any) => response?.data?.updateUser,
      invalidatesTags: ["Users", "User"],
    }),

    updateUserStatus: builder.mutation<User, UpdateUserStatusRequest>({
      query: (input) => ({
        url: "",
        method: "POST",
        body: {
          query: `
            mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
              updateUserStatus(input: $input) {
                id
                pid
                email
                name
                role
                status
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input },
        },
      }),
      transformResponse: (response: any) => response?.data?.updateUserStatus,
      invalidatesTags: ["Users", "User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutationMutation,
  useGetCaptchaQuery,
  useLazyGetCaptchaQuery,
  useGetMeQuery,
  useGetUsersQuery,
  useGetPaginatedUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useLazyGetMeQuery,
  useLazyGetUsersQuery,
  useLazyGetPaginatedUsersQuery,
  useLazyGetUserByIdQuery,
} = authApi;
