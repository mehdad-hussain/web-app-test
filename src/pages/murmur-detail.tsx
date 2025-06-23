import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Mock data for development
const MOCK_MURMUR = {
  id: "murmur-1",
  text: "This is a detailed view of a mock murmur with some example content that could be longer or shorter depending on what the user writes.",
  authorId: "user-1",
  authorName: "User 1",
  likeCount: 42,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  isOwnMurmur: false,
};

export default function MurmurDetailPage() {
  const { id } = useParams();
  const murmur = MOCK_MURMUR; // In real app, fetch based on id

  const handleLike = () => {
    // TODO: Implement like functionality
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Murmur</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to={`/users/${murmur.authorId}`}
              className="font-semibold hover:underline"
            >
              {murmur.authorName}
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(murmur.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-900 dark:text-gray-100 text-lg mb-6">
            {murmur.text}
          </p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 gap-2"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4" />
              <span>{murmur.likeCount} likes</span>
            </Button>
            {murmur.isOwnMurmur && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-500 gap-2 ml-auto"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
} 