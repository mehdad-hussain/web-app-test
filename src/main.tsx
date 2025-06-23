import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ui/error-boundary';
import { Toaster } from './components/ui/sonner';
import './index.css';
import LoginPage from './pages/login';
import MurmurDetailPage from './pages/murmur-detail';
import ProfilePage from './pages/profile';
import RegisterPage from './pages/register';
import SettingsPage from './pages/settings';
import TimelinePage from './pages/timeline';
import UserProfilePage from './pages/user-profile';
import VerifyEmailPage from './pages/verify-email';

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <TimelinePage />
      </ProtectedRoute>
    ),
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
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/murmurs/:id",
    element: (
      <ProtectedRoute>
        <MurmurDetailPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/users/:id",
    element: (
      <ProtectedRoute>
        <UserProfilePage />
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