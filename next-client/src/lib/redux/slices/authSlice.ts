import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  pid: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null; // Stored strictly in memory, never in localStorage
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    updateAccessToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
    },
    setInitialized: (state) => {
      state.isInitializing = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, updateAccessToken, setInitialized, logout } =
  authSlice.actions;

export default authSlice.reducer;
