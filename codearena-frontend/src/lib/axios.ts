import axios from "axios"
import { normalizeError } from "./api-errors"
import { useAuthStore } from "../store/auth.store"

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = "Bearer " + token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeError(error)
    
    if (normalized.statusCode === 401) {
      console.warn("Unauthorized access - logging out")
      localStorage.removeItem("token")
      useAuthStore.getState().logout()
      // Optional: redirect to login if not already there
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login"
      }
    }
    
    return Promise.reject(normalized)
  }
)
