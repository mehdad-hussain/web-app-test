import { Button } from "@/components/ui/button";
import { useCurrentSession } from "@/hooks/use-current-session";
import api from "@/lib/api";
import { UserProfile } from "@/lib/auth-types";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { actions } = useAuthStore();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile");
      return response.data;
    },
  });

  const {
    data: session,
    isLoading: isLoadingSession,
    isError: isErrorSession,
  } = useCurrentSession();

  if (isLoadingProfile || isLoadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Session Info</h1>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/">Back to Dashboard</Link>
              </Button>
              <Button variant="destructive" onClick={() => actions.logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h2>
          {isErrorProfile ? (
            <div className="text-red-500">
              Could not load profile data. Your session may have expired.
            </div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.name || 'Not set'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{profile.email}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Current Session</h2>
          {isErrorSession ? (
             <div className="text-red-500">
               Could not load session data.
             </div>
          ) : session ? (
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Device</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{session.currentSession.deviceInfo}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{session.currentSession.ipAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{format(new Date(session.currentSession.lastUsed), "PPP p")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{format(new Date(session.currentSession.expires), "PPP p")}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {session?.otherSessions && session.otherSessions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Other Active Sessions</h2>
            <ul className="space-y-4">
              {session.otherSessions.map((s: any) => (
                <li key={s.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Device</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white truncate">{s.deviceInfo}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{s.ipAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Used</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{format(new Date(s.lastUsed), "PPP p")}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
} 