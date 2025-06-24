import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FollowButton } from "@/components/ui/follow-button";
import { MurmurCard } from "@/components/ui/murmur-card";
import { useCurrentSession } from "@/hooks/use-current-session";
import type { PaginatedResponse } from "@/lib/api";
import { getFollowCounts, getUserMurmurs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function UserProfilePage() {
  const { id } = useParams();
  const { data: session } = useCurrentSession();
  const userId = id!;

  // Fetch murmurs for this user
  const { data: murmursData, isLoading: isLoadingMurmurs } = useQuery<PaginatedResponse>({
    queryKey: ["user-murmurs", userId],
    queryFn: () => getUserMurmurs(userId),
  });  // Fetch follow counts
  const { data: followCounts } = useQuery({
    queryKey: ["user-follow-counts", userId],
    queryFn: () => getFollowCounts(userId),
  });

  // Check if this is the current user's profile
  const isOwnProfile = session?.currentSession?.userId === userId;

  // Use first murmur's author as fallback for user info
  const user = murmursData?.murmurs[0]?.author || { name: "", id: userId };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h2>              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{followCounts?.followersCount ?? 0} followers</span>
                <span>{followCounts?.followingCount ?? 0} following</span>
              </div>
            </div>            {!isOwnProfile && (
              <FollowButton userId={userId} />
            )}
          </div>
        </Card>

        {/* User's Murmurs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Murmurs
          </h3>
          {isLoadingMurmurs ? (
            <div>Loading...</div>
          ) : (
            murmursData?.murmurs.map((murmur) => (
              <MurmurCard
                key={murmur.id}
                id={murmur.id}
                text={murmur.content}
                authorId={murmur.author.id}
                authorName={murmur.author.name || ""}
                authorImage={murmur.author.image}
                likeCount={murmur.likeCount}
                createdAt={murmur.createdAt}
                isOwnMurmur={false}
                isLiked={murmur.isLiked}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}