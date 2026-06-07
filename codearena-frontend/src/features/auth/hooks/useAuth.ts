import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/auth"
import { useAuthStore } from "../../../store/auth.store"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { NormalizedError } from "../../../lib/api-errors"

export const useAuth = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.user) setUser(data.user)
      if (data.token) localStorage.setItem("token", data.token)
      toast.success("Welcome back!")
      navigate("/problems")
    },
    onError: (error: NormalizedError) => {
      toast.error(error.message || "Failed to login")
    }
  })

  const registerMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      if (data.user) setUser(data.user)
      if (data.token) localStorage.setItem("token", data.token)
      toast.success("Account created successfully!")
      navigate("/problems")
    },
    onError: (error: NormalizedError) => {
      toast.error(error.message || "Failed to register")
    }
  })

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as NormalizedError | null,
    
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as NormalizedError | null,
  }
}
