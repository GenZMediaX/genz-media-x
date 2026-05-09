import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPosts, useGetCategories, getGetPostsQueryKey, getGetCategoriesQueryKey } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Search } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: categories } = useGetCategories();
  const category = categories?.find(c => c.id === id);

  const params: any = { category: id };
  if (search) params.search = search;

  const { data, isLoading } = useGetPosts(params, { enabled: !!id });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/feed">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Feed
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-black text-xl">
              {(category?.name ?? id ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black">{category?.name ?? id}</h1>
              <p className="text-muted-foreground text-sm">{category?.description ?? ""}</p>
              {category && <p className="text-xs text-muted-foreground mt-1">{category.postCount} posts</p>}
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search in ${category?.name ?? id}...`}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-10 pr-20 bg-muted/30"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-primary hover:bg-primary/90">
            Search
          </Button>
        </form>

        {/* Posts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <div className="space-y-4">
            {data.posts.map((post, i) => (
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
            <p className="font-semibold">No posts yet in this category</p>
            <p className="text-sm mt-1">Be the first to post here!</p>
            <Link href="/feed">
              <Button className="mt-4 bg-primary hover:bg-primary/90">Create a Post</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
