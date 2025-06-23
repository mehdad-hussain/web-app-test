import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Card } from "./card";

interface MurmurCardProps {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  likeCount: number;
  createdAt: string;
  isOwnMurmur?: boolean;
}

export function MurmurCard({
  id,
  text,
  authorId,
  authorName,
  likeCount,
  createdAt,
  isOwnMurmur = false,
}: MurmurCardProps) {
  const handleLike = () => {
    // TODO: Implement like functionality
    console.log("Like clicked");
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete clicked");
  };

  // Determine the author link based on whether it's the current user
  const authorLink = isOwnMurmur ? "/profile" : `/users/${authorId}`;

  return (
    <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={authorLink}
              className="font-semibold hover:underline"
            >
              {authorName}
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <Link to={`/murmurs/${id}`} className="block mb-4">
            <p className="text-gray-900 dark:text-gray-100">{text}</p>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 gap-2"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4" />
              <span>{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500 gap-2"
              asChild
            >
              <Link to={`/murmurs/${id}`}>
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </Link>
            </Button>
            {isOwnMurmur && (
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
        </div>
      </div>
    </Card>
  );
} 