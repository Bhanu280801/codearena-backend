import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import * as z from "zod"
import type { NormalizedError } from "../../../lib/api-errors"
import { authApi } from "../api/auth"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") || ""
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigate("/login")
    },
  })

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({ token, password: data.password })
  }

  const error = resetPasswordMutation.error as NormalizedError | null

  return (
    <div className="flex-1 flex min-h-screen items-center justify-center p-6 sm:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 glass-card p-8 rounded-xl"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Choose a new password</h2>
          <p className="text-sm text-muted-foreground">
            Use at least 6 characters for your new password.
          </p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <p className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              This reset link is missing a token.
            </p>
            <Link to="/forgot-password" className="block text-sm text-primary hover:underline">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error.message}</p>}

            <button
              disabled={resetPasswordMutation.isPending}
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {resetPasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center text-sm text-primary hover:underline">
          Back to login
        </Link>
      </motion.div>
    </div>
  )
}
