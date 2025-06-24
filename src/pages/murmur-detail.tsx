import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSession } from "@/hooks/use-current-session";
import api, { deleteMurmur, likeMurmur, unlikeMurmur } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function MurmurDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status } = useAuthStore();
  const { data: session } = useCurrentSession();
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch murmur details
  const {
    data: murmur,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["murmur-detail", id],
    queryFn: async () => {
      const response = await api.get(`/murmurs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const handleLikeToggle = async () => {
    if (!murmur) return;
    setLikeLoading(true);
    try {
      if (murmur.isLiked) {
        await unlikeMurmur(murmur.id);
      } else {
        await likeMurmur(murmur.id);
      }
      await refetch();
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!murmur) return;
    setDeleteLoading(true);
    try {
      await deleteMurmur(murmur.id);
      navigate("/profile");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (isError || !murmur) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">Murmur not found.</div>
        <Button asChild variant="outline">
          <Link to="/">Back to Timeline</Link>
        </Button>
      </div>
    );
  }

  const isOwnMurmur = session?.currentSession?.userId === murmur.author.id;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Murmur Detail</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to={`/users/${murmur.author.id}`}
              className="font-semibold hover:underline"
            >
              {murmur.author.name || "Anonymous"}
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(murmur.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-900 dark:text-gray-100 text-lg mb-6">
            {murmur.content}
          </p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${
                murmur.isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
              }`}
              onClick={handleLikeToggle}
              disabled={likeLoading || status !== "authenticated"}
            >
              <Heart className="w-4 h-4" fill={murmur.isLiked ? "currentColor" : "none"} />
              <span>{murmur.likeCount}</span>
              <span className="sr-only">Like</span>
            </Button>
            {isOwnMurmur && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 gap-2 ml-auto"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteLoading ? "Deleting..." : "Delete"}</span>
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}