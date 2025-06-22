import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { status } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex gap-4">
              {status === 'authenticated' ? (
                <Button asChild variant="outline">
                  <Link to="/profile">View Profile</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Our Platform</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is a public dashboard page that anyone can access. To view your profile and access
            protected features, please log in to your account.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* Example feature cards */}
            <div className="border dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feature 1</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Description of feature 1 goes here.
              </p>
            </div>
            <div className="border dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feature 2</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Description of feature 2 goes here.
              </p>
            </div>
            <div className="border dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-2">Feature 3</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Description of feature 3 goes here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 