import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/use-follow";
import { UserMinus, UserPlus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showText?: boolean;
  className?: string;
}

export function FollowButton({ 
  userId, 
  variant = "default", 
  size = "default", 
  showText = true,
  className 
}: FollowButtonProps) {
  const { 
    isFollowing, 
    isLoading, 
    toggleFollow, 
    isAuthenticated 
  } = useFollow(userId);

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = async () => {
    await toggleFollow();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isFollowing ? "outline" : variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        "Loading..."
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          {showText && <span className="ml-2">Unfollow</span>}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          {showText && <span className="ml-2">Follow</span>}
        </>
      )}
    </Button>
  );
}
