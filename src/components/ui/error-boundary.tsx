import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from './button';
import { useEffect } from 'react';

interface ErrorPageProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export function ErrorBoundary({ error, resetErrorBoundary }: ErrorPageProps) {
  const navigate = useNavigate();
  const routeError = useRouteError();
  
  // If using as error boundary for routes
  const errorMessage = isRouteErrorResponse(routeError) 
    ? routeError.data?.message || routeError.statusText
    : error?.message || 'Something went wrong';

  const status = isRouteErrorResponse(routeError) ? routeError.status : 500;

  useEffect(() => {
    // Log error to your error tracking service
    console.error('Error:', routeError || error);
  }, [routeError, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500 mb-4">{status}</h1>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {status === 404 ? 'Page Not Found' : 'Oops! Something went wrong'}
            </h2>
            <p className="text-gray-600">
              {errorMessage}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Go Home
            </Button>
            {resetErrorBoundary && (
              <Button
                onClick={resetErrorBoundary}
                variant="default"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 