import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import './index.css'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import VerifyEmailPage from './pages/verify-email'
import { Toaster } from './components/ui/sonner'
import { ErrorBoundary } from './components/ui/error-boundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import DashboardPage from './pages/dashboard';
import ProfilePage from './pages/profile';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
    errorElement: <ErrorBoundary />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors />
    </QueryClientProvider>
  </React.StrictMode>,
)