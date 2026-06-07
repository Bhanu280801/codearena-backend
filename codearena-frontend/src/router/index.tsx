import { lazy, Suspense, type ReactNode } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import RootLayout from "../components/layout/RootLayout"
import ProtectedRoute from "../components/layout/ProtectedRoute"

const LandingPage = lazy(() => import("../features/auth/pages/LandingPage"))
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"))
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("../features/auth/pages/ResetPasswordPage"))
const AdminProblemsPage = lazy(() => import("../features/workspace/pages/AdminProblemsPage"))
const ProblemsPage = lazy(() => import("../features/workspace/pages/ProblemsPage"))
const WorkspacePage = lazy(() => import("../features/workspace/pages/WorkspacePage"))

const PageFallback = () => <div className="min-h-screen bg-background" />

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageFallback />}>
    {element}
  </Suspense>
)

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<LandingPage />),
      },
      {
        path: "problems",
        element: withSuspense(<ProblemsPage />),
      },
      {
        path: "login",
        element: withSuspense(<LoginPage />),
      },
      {
        path: "register",
        element: withSuspense(<RegisterPage />),
      },
      {
        path: "forgot-password",
        element: withSuspense(<ForgotPasswordPage />),
      },
      {
        path: "reset-password",
        element: withSuspense(<ResetPasswordPage />),
      },
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            path: "admin/problems",
            element: withSuspense(<AdminProblemsPage />),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/problems/:id",
        element: withSuspense(<WorkspacePage />),
      },
    ],
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
