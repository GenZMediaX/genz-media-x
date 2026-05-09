import { motion } from "framer-motion";
import { useGetBookmarks, getGetBookmarksQueryKey } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Bookmark, Loader2 } from "lucide-react";

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useGetBookmarks();

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary fill-primary" />
            Saved Posts
          </h1>
          <p className="text-muted-foreground text-sm">Your bookmarked content</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (bookmarks ?? []).length > 0 ? (
          <div className="space-y-4">
            {(bookmarks ?? []).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PostCard post={post as any} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No bookmarks yet</p>
            <p className="text-sm mt-1">Save posts by clicking the bookmark icon</p>
          </div>
        )}
      </div>
    </div>
  );
}
