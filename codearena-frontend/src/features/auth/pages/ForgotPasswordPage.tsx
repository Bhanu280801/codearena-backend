import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Loader2, Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import * as z from "zod"
import type { NormalizedError } from "../../../lib/api-errors"
import { authApi, type ForgotPasswordResponse } from "../api/auth"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [response, setResponse] = useState<ForgotPasswordResponse | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => setResponse(data),
  })

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setResponse(null)
    forgotPasswordMutation.mutate(data)
  }

  const error = forgotPasswordMutation.error as NormalizedError | null

  return (
    <div className="flex-1 flex min-h-screen items-center justify-center p-6 sm:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 glass-card p-8 rounded-xl"
      >
        <div className="space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Reset your password</h2>
            <p className="text-sm text-muted-foreground">
              Enter your account email and we will prepare a password reset link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error.message}</p>}

          {response && (
            <div className="space-y-2 rounded-md border border-border bg-background p-3 text-sm">
              <p className="text-muted-foreground">{response.message}</p>
              {response.resetUrl && (
                <Link className="block break-all text-primary hover:underline" to={new URL(response.resetUrl).pathname + new URL(response.resetUrl).search}>
                  Open reset link
                </Link>
              )}
            </div>
          )}

          <button
            disabled={forgotPasswordMutation.isPending}
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {forgotPasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {forgotPasswordMutation.isPending ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link to="/login" className="block text-center text-sm text-primary hover:underline">
          Back to login
        </Link>
      </motion.div>
    </div>
  )
}
