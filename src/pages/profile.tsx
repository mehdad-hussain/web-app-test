import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MurmurCard } from "@/components/ui/murmur-card";
import { MurmurDialog } from "@/components/ui/murmur-dialog";
import api from "@/lib/api";
import { UserProfile } from "@/lib/auth-types";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";

// Mock data for development
const MOCK_USER_MURMURS = Array.from({ length: 10 }, (_, i) => ({
  id: `murmur-${i + 1}`,
  text: `This is my murmur ${i + 1} with some example content.`,
  authorId: "current-user",
  authorName: "Current User",
  likeCount: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
}));

export default function ProfilePage() {
  const { status, actions } = useAuthStore();

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

  // Mock data for followers/following count
  const followersCount = 1234;
  const followingCount = 567;

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <div className="flex gap-4">
              {status === 'authenticated' ? (
                <>
                  <Button asChild variant="outline">
                    <Link to="/settings">Account Settings</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">Back to Timeline</Link>
                  </Button>
                  <Button variant="destructive" onClick={() => actions.logout()}>
                    Logout
                  </Button>
                </>
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="p-6 mb-8">
          {isErrorProfile ? (
            <div className="text-red-500">
              Could not load profile data. Your session may have expired.
            </div>
          ) : profile ? (
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.image || ''} alt={profile?.name || ''} />
                <AvatarFallback>{profile?.name || ''}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.name || 'Anonymous'}</h1>
                <p className="text-gray-500">@{profile.name}</p>
                <div className="mt-4 flex gap-4">
                  <div>
                    <span className="font-bold">{followersCount} followers</span>{" "}
                    <span className="text-gray-500">Followers</span>
                  </div>
                  <div>
                    <span className="font-bold">{followingCount} following</span>{" "}
                    <span className="text-gray-500">Following</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* User's Murmurs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Murmurs
            </h3>
            <MurmurDialog trigger={<Button>New Murmur</Button>} />
          </div>
          {MOCK_USER_MURMURS.map((murmur) => (
            <MurmurCard
              key={murmur.id}
              {...murmur}
              isOwnMurmur={true}
            />
          ))}
        </div>
      </main>
    </div>
  );
} 