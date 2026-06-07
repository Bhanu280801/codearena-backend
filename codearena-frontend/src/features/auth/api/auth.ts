import { api } from "../../../lib/axios"

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string | number;
    username: string;
    email: string;
    role: string;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginCredentials {
  username: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
  resetUrl?: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },
  
  signup: async (userData: SignupPayload): Promise<AuthResponse> => {
    const response = await api.post("/auth/signup", userData)
    return response.data
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await api.get("/auth/profile")
    return response.data
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/forgot-password", payload)
    return response.data
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
    const response = await api.post("/auth/reset-password", payload)
    return response.data
  }
}
