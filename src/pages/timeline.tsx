import { Button } from "@/components/ui/button";
import { MurmurCard } from "@/components/ui/murmur-card";
import { MurmurDialog } from "@/components/ui/murmur-dialog";
import { useCurrentSession } from "@/hooks/use-current-session";
import { useMurmurs } from "@/hooks/use-murmurs";
import { useAuthStore } from "@/store/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TimelinePage() {
  const { status, actions } = useAuthStore();
  const { data: session } = useCurrentSession();
  const {
    murmurs,
    loading,
    error,
    page,
    totalPages,
    setPage,
    create,
    remove,
    like,
    unlike,
    refresh
  } = useMurmurs({
    type: status === 'authenticated' ? 'timeline' : 'all',
    limit: 10
  });

  const handleCreateMurmur = async (content: string) => {
    await create(content);
  };

  const handleDeleteMurmur = async (id: string) => {
    await remove(id);
  };

  const handleLikeToggle = async (id: string, isLiked: boolean) => {
    if (isLiked) {
      await unlike(id);
    } else {
      await like(id);
    }
  };

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
            <MurmurDialog onSubmit={handleCreateMurmur} />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400">
            {error}
            <Button variant="outline" onClick={refresh} className="ml-2">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {murmurs.map((murmur) => (
              <MurmurCard
                key={murmur.id}
                id={murmur.id}
                text={murmur.content}
                authorId={murmur.authorId}
                authorName={murmur.author.name || 'Anonymous'}
                authorImage={murmur.author.image}
                likeCount={murmur.likeCount}
                createdAt={murmur.createdAt}
                isLiked={murmur.isLiked}
                isOwnMurmur={session?.currentSession?.userId === murmur.authorId}
                onDelete={status === 'authenticated' ? handleDeleteMurmur : undefined}
                onLikeToggle={status === 'authenticated' ? handleLikeToggle : undefined}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
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
        )}
      </main>
    </div>
  );
} 