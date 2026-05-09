import { useState } from "react";
import { motion } from "framer-motion";
import { useAdminGetStats, useAdminGetUsers, useAdminGetPosts, useAdminFeaturePost, useAdminDeleteUser } from "@/lib/api";
import { getAdminGetStatsQueryKey, getAdminGetUsersQueryKey, getAdminGetPostsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Users, FileText, Star, Trash2, Loader2, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"stats" | "users" | "posts">("stats");

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user]);

  const { data: stats, isLoading: statsLoading } = useAdminGetStats({ enabled: !!user?.isAdmin });
  const { data: usersData, isLoading: usersLoading } = useAdminGetUsers(undefined, { enabled: tab === "users" && !!user?.isAdmin });
  const { data: postsData, isLoading: postsLoading } = useAdminGetPosts(undefined, { enabled: tab === "posts" && !!user?.isAdmin });
  const featureMutation = useAdminFeaturePost();
  const deleteMutation = useAdminDeleteUser();

  const handleFeature = async (postId: number) => {
    await featureMutation.mutateAsync(postId);
    queryClient.invalidateQueries({ queryKey: getAdminGetPostsQueryKey() });
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Delete this user?")) return;
    await deleteMutation.mutateAsync(userId);
    queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
  };

  if (!user?.isAdmin) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <p className="text-muted-foreground">Access denied</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-black">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["stats", "users", "posts"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                tab === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {tab === "stats" && (
          <div>
            {statsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-600 to-indigo-600" },
                    { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "from-purple-600 to-violet-600" },
                    { label: "Total Comments", value: stats.totalComments, icon: TrendingUp, color: "from-pink-600 to-rose-600" },
                    { label: "Requirements", value: stats.totalRequirements, icon: Shield, color: "from-amber-600 to-orange-600" },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-card-border rounded-2xl p-5"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-black">{stat.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {stats.postsByCategory.length > 0 && (
                  <div className="bg-card border border-card-border rounded-2xl p-5">
                    <h3 className="font-bold mb-4">Posts by Category</h3>
                    <div className="space-y-2">
                      {stats.postsByCategory.map(cat => (
                        <div key={cat.category} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground capitalize w-40 shrink-0">{cat.category.replace(/-/g, " ")}</span>
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min((cat.count / stats.totalPosts) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            {usersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Role</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersData?.users ?? []).map((u: any) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                              {u.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {u.isAdmin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <div>
            {postsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-3">
                {(postsData?.posts ?? []).map((post: any) => (
                  <div key={post.id} className="bg-card border border-card-border rounded-xl p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{post.author?.name ?? "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                          {post.category.replace(/-/g, " ")}
                        </span>
                        {post.isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Featured</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
                    </div>
                    <Button
                      variant={post.isFeatured ? "default" : "outline"}
                      size="sm"
                      className={`shrink-0 gap-1.5 text-xs h-7 ${post.isFeatured ? "bg-primary hover:bg-primary/90" : ""}`}
                      onClick={() => handleFeature(post.id)}
                    >
                      <Star className="w-3 h-3" />
                      {post.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
