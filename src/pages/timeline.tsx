import { Button } from "@/components/ui/button";
import { MurmurCard } from "@/components/ui/murmur-card";
import { MurmurDialog } from "@/components/ui/murmur-dialog";
import { useCurrentSession } from "@/hooks/use-current-session";
import { useAuthStore } from "@/store/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Mock data for development
const MOCK_MURMURS = Array.from({ length: 30 }, (_, i) => ({
  id: `murmur-${i + 1}`,
  text: `This is a mock murmur ${i + 1} with some example content that could be longer or shorter depending on what the user writes.`,
  authorId: `user-${(i % 5) + 1}`,
  authorName: `User ${(i % 5) + 1}`,
  likeCount: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  isCurrentUser: (i % 5) === 0, // Every 5th murmur will be from current user
}));

export default function TimelinePage() {
  const { status, actions } = useAuthStore();
  const { isAuthenticated } = useCurrentSession();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(MOCK_MURMURS.length / itemsPerPage);

  const currentMurmurs = MOCK_MURMURS.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
            <div className="flex gap-4">
              {status === 'authenticated' ? (
                <>
                  <Button asChild variant="outline">
                    <Link to="/profile">View Profile</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/settings">Account Settings</Link>
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
        {status === 'authenticated' && (
          <div className="mb-8">
            <MurmurDialog />
          </div>
        )}

        <div className="space-y-4">
          {currentMurmurs.map((murmur) => (
            <MurmurCard
              key={murmur.id}
              {...murmur}
              isOwnMurmur={murmur.isCurrentUser}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
} 