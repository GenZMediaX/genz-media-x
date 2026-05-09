import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPost, useGetComments, useCreateComment, getGetPostQueryKey, getGetCommentsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id ?? "0", 10);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: post, isLoading: postLoading } = useGetPost(postId);
  const { data: comments, isLoading: commentsLoading } = useGetComments(postId);
  const createComment = useCreateComment();

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await createComment.mutateAsync({ postId, content: comment });
    queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(postId) });
    setComment("");
  };

  if (postLoading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <p className="text-muted-foreground">Post not found</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/feed">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>

        <PostCard post={post as any} />

        {/* Comments */}
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-4">{post.commentCount} Comments</h2>

          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="min-h-[80px] bg-muted/30 resize-none mb-2"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2" disabled={createComment.isPending}>
                {createComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Comment
              </Button>
            </form>
          )}

          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {(comments ?? []).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <Link href={`/profile/${c.author.id}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.author.name[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <div className="flex-1 bg-muted/30 rounded-xl p-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold">{c.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{c.content}</p>
                  </div>
                </motion.div>
              ))}
              {(comments?.length ?? 0) === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No comments yet. Be the first!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
