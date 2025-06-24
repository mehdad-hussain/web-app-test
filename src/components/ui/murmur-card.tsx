import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { Card } from "./card";
import { FollowButton } from "./follow-button";

interface MurmurCardProps {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorImage?: string | null;
  likeCount: number;
  createdAt: string;
  isOwnMurmur?: boolean;
  isLiked?: boolean;
  onDelete?: (id: string) => Promise<void>;
  onLikeToggle?: (id: string, isLiked: boolean) => Promise<void>;
}

export function MurmurCard({
  id,
  text,
  authorId,
  authorName,
  authorImage,
  likeCount,
  createdAt,
  isOwnMurmur = false,
  isLiked = false,
  onDelete,
  onLikeToggle,
}: MurmurCardProps) {
  // Suppress unused parameter warning
  void authorImage;
  const handleLike = async () => {
    try {
      await onLikeToggle?.(id, isLiked);
    } catch (error) {
      // Error handling is done by the API client
      console.error('Failed to toggle like:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete?.(id);
    } catch (error) {
      // Error handling is done by the API client
      console.error('Failed to delete murmur:', error);
    }
  };

  // Determine the author link based on whether it's the current user
  const authorLink = isOwnMurmur ? "/profile" : `/users/${authorId}`;

  return (
    <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex gap-4">
        <div className="flex-1">          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
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
            {!isOwnMurmur && (
              <FollowButton 
                userId={authorId} 
                variant="outline" 
                size="sm" 
                showText={false} 
                className="ml-auto"
              />
            )}
          </div>
          <Link to={`/murmurs/${id}`} className="block mb-4">
            <p className="text-gray-900 dark:text-gray-100">{text}</p>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 hover:text-red-500'
              }`}
              onClick={handleLike}
              disabled={!onLikeToggle}
            >
              <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
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
            {isOwnMurmur && onDelete && (
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