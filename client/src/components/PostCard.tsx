import { useState } from "react";
import { Link } from "wouter";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikePost, useBookmarkPost, getGetPostsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  content: string;
  imageUrl?: string | null;
  category: string;
  author: { id: number; name: string; username: string; avatarUrl?: string | null };
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  travelling: "bg-blue-500/20 text-blue-400",
  creator: "bg-purple-500/20 text-purple-400",
  "social-media-management": "bg-pink-500/20 text-pink-400",
  "book-reading": "bg-amber-500/20 text-amber-400",
  work: "bg-green-500/20 text-green-400",
  requirements: "bg-orange-500/20 text-orange-400",
  "nearby-places": "bg-cyan-500/20 text-cyan-400",
  "nearby-hotels": "bg-indigo-500/20 text-indigo-400",
  "nearby-temples": "bg-yellow-500/20 text-yellow-400",
  "medical-awareness": "bg-red-500/20 text-red-400",
  videography: "bg-violet-500/20 text-violet-400",
  photography: "bg-teal-500/20 text-teal-400",
};

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);

  const likeMutation = useLikePost();
  const bookmarkMutation = useBookmarkPost();

  const handleLike = async () => {
    if (!user) return;
    const prev = liked;
    setLiked(!prev);
    setLikeCount(c => prev ? c - 1 : c + 1);
    try {
      await likeMutation.mutateAsync(post.id);
      queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
    } catch {
      setLiked(prev);
      setLikeCount(c => prev ? c + 1 : c - 1);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    setBookmarked(b => !b);
    try {
      await bookmarkMutation.mutateAsync(post.id);
    } catch {
      setBookmarked(b => !b);
    }
  };

  const catColor = CATEGORY_COLORS[post.category] ?? "bg-gray-500/20 text-gray-400";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.id}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {post.author.name[0]?.toUpperCase()}
            </div>
          </Link>
          <div>
            <Link href={`/profile/${post.author.id}`}>
              <p className="font-semibold text-sm hover:text-primary transition-colors">{post.author.name}</p>
            </Link>
            <p className="text-xs text-muted-foreground">@{post.author.username} · {timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>
            {post.category.replace(/-/g, " ")}
          </span>
          {post.isFeatured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`}>
        <p className="text-sm leading-relaxed text-foreground/90 mb-3 cursor-pointer hover:text-foreground transition-colors line-clamp-4">
          {post.content}
        </p>
      </Link>

      {post.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden bg-muted">
          <img src={post.imageUrl} alt="Post" className="w-full object-cover max-h-60" loading="lazy" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs h-7 px-2 ${liked ? "text-rose-400" : "text-muted-foreground"}`}
            onClick={handleLike}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Link href={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2 text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.commentCount}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2 text-muted-foreground"
            onClick={() => navigator.share?.({ text: post.content }).catch(() => {})}
          >
            <Share2 className="w-3.5 h-3.5" />
            {post.shareCount}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${bookmarked ? "text-primary" : "text-muted-foreground"}`}
          onClick={handleBookmark}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
