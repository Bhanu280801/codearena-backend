import axios, { AxiosError } from "axios";

export interface NormalizedError {
  success: false;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

export function normalizeError(error: unknown): NormalizedError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    if (!axiosError.response) {
      return {
        success: false,
        message: "Cannot reach the backend API. Make sure it is running on http://localhost:5000 and that you opened the frontend from localhost or 127.0.0.1.",
        originalError: error
      };
    }
    
    // Extract the message from backend response if available
    const backendMessage = 
      axiosError.response?.data?.message || 
      axiosError.response?.data?.error || 
      "An unexpected server error occurred.";

    return {
      success: false,
      message: backendMessage,
      statusCode: axiosError.response?.status,
      originalError: error
    };
  }

  // Handle generic JS errors
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      originalError: error
    };
  }

  return {
    success: false,
    message: "An unknown error occurred.",
    originalError: error
  };
}
