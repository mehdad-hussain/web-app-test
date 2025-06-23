import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MurmurCard } from "@/components/ui/murmur-card";
import { useCurrentSession } from "@/hooks/use-current-session";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Mock data for development
const MOCK_USER = {
  id: "user-1",
  name: "John Doe",
  followersCount: 1234,
  followingCount: 567,
};

const MOCK_USER_MURMURS = Array.from({ length: 10 }, (_, i) => ({
  id: `murmur-${i + 1}`,
  text: `This is a mock murmur ${i + 1} from ${MOCK_USER.name} with some example content.`,
  authorId: MOCK_USER.id,
  authorName: MOCK_USER.name,
  likeCount: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
}));

export default function UserProfilePage() {
  const { id } = useParams();
  const { data: session } = useCurrentSession();
  const user = MOCK_USER; // In real app, fetch based on id
  const murmurs = MOCK_USER_MURMURS;

  // Check if this is the current user's profile
  const isOwnProfile = session?.id === user.id;

  const handleFollow = () => {
    // TODO: Implement follow functionality
  };

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
              </h2>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{user.followersCount} followers</span>
                <span>{user.followingCount} following</span>
              </div>
            </div>
            {!isOwnProfile && (
              <Button onClick={handleFollow}>
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </Button>
            )}
          </div>
        </Card>

        {/* User's Murmurs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Murmurs
          </h3>
          {murmurs.map((murmur) => (
            <MurmurCard
              key={murmur.id}
              {...murmur}
              isOwnMurmur={false} // Never show delete button on other user's profile
            />
          ))}
        </div>
      </main>
    </div>
  );
} 