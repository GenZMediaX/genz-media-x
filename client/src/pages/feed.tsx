import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetPosts, useGetCategories, useCreatePost, getGetPostsQueryKey } from "@/lib/api";
import { getGetCategoriesQueryKey } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, X, Loader2 } from "lucide-react";

export default function FeedPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", category: "creator" });

  // Check for search in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("search");
    if (s) { setSearch(s); setSearchInput(s); }
  }, []);

  const params: any = {};
  if (category !== "all") params.category = category;
  if (search) params.search = search;

  const { data, isLoading } = useGetPosts(params);
  const { data: categories } = useGetCategories();
  const createMutation = useCreatePost();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    await createMutation.mutateAsync(newPost);
    queryClient.invalidateQueries({ queryKey: getGetPostsQueryKey() });
    setNewPost({ content: "", category: "creator" });
    setShowCreate(false);
  };

  const allCategories = [
    { id: "all", name: "All Categories" },
    ...(categories ?? [])
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">Community Feed</h1>
            <p className="text-muted-foreground text-sm">Discover what's happening</p>
          </div>
          {user && (
            <Button
              onClick={() => setShowCreate(s => !s)}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? "Cancel" : "New Post"}
            </Button>
          )}
        </div>

        {/* Create post */}
        {showCreate && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-card-border rounded-xl p-5 mb-6"
          >
            <form onSubmit={handleCreate} className="space-y-3">
              <Textarea
                placeholder="Share something with the community..."
                value={newPost.content}
                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                className="min-h-[100px] bg-muted/30 resize-none"
                required
              />
              <div className="flex gap-3">
                <Select value={newPost.category} onValueChange={v => setNewPost(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="flex-1 bg-muted/30">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-10 pr-20 bg-muted/30"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-primary hover:bg-primary/90">
            Search
          </Button>
        </form>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <div className="space-y-4">
            {data.posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostCard post={post as any} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold">No posts found</p>
            <p className="text-sm mt-1">
              {search ? `No results for "${search}"` : "Be the first to post in this category!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
