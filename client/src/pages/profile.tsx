import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetUser,
  useUpdateUserProfile,
  useGetPosts,
  getGetPostsQueryKey,
} from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Loader2, Calendar, Pencil, Check, X, Camera, User, MessageSquare, Heart, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
type Tab = "posts" | "comments" | "likes";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const uid = parseInt(userId ?? "0", 10);
  const { user: currentUser } = useAuth();
  const isOwn = currentUser?.id === uid;
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    age: "",
    gender: "",
    avatarUrl: "",
  });

  const { data: profile, isLoading: profileLoading } = useGetUser(uid);

  const { mutateAsync: updateProfile } = useUpdateUserProfile();

  const { data: posts, isLoading: postsLoading } = useGetPosts({});

  const userPosts = (posts?.posts ?? []).filter((p) => p.authorId === uid);

  const openEdit = useCallback(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        bio: (profile as any).bio ?? "",
        age: (profile as any).age != null ? String((profile as any).age) : "",
        gender: (profile as any).gender ?? "",
        avatarUrl: (profile as any).avatarUrl ?? "",
      });
    }
    setEditing(true);
  }, [profile]);

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateProfile({
        userId: uid,
        data: {
          name: form.name || undefined,
          bio: form.bio || undefined,
          age: form.age ? parseInt(form.age, 10) : undefined,
          gender: form.gender || undefined,
          avatarUrl: form.avatarUrl || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["user", uid] });
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setForm((prev) => ({ ...prev, avatarUrl: result }));
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const displayAvatar = editing ? form.avatarUrl : (profile as any).avatarUrl;
  const displayBio = (profile as any).bio;
  const displayAge = (profile as any).age;
  const displayGender = (profile as any).gender;
  const commentCount = (profile as any).commentCount ?? 0;
  const likeCount = (profile as any).likeCount ?? 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "posts", label: "Posts", icon: <FileText className="w-4 h-4" />, count: profile.postCount },
    { id: "comments", label: "Comments", icon: <MessageSquare className="w-4 h-4" />, count: commentCount },
    { id: "likes", label: "Likes", icon: <Heart className="w-4 h-4" />, count: likeCount },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-2xl overflow-hidden mb-6"
        >
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-primary/40 via-violet-600/30 to-indigo-600/40" />

          <div className="px-6 pb-6">
            {/* Avatar + action buttons */}
            <div className="-mt-14 mb-4 flex items-end justify-between">
              <div className="relative group">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-2xl border-4 border-card object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-violet-600 border-4 border-card flex items-center justify-center text-white text-3xl font-black select-none">
                    {profile.name[0]?.toUpperCase()}
                  </div>
                )}

                {/* Photo overlay — only when editing own profile */}
                {editing && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={photoUploading}
                      className="absolute inset-0 rounded-2xl bg-black/55 flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {photoUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span className="text-xs font-semibold">Change photo</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>

              {/* Edit / Save / Cancel */}
              {isOwn && (
                <div className="flex gap-2 mb-1">
                  {editing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving} className="h-8 gap-1.5 text-xs">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={saving} className="h-8 gap-1.5 text-xs">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={openEdit} className="h-8 gap-1.5 text-xs">
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                /* ── Edit form ── */
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className="w-full bg-muted/40 border border-card-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">About</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell the world about yourself..."
                      rows={3}
                      className="w-full bg-muted/40 border border-card-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Age</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={form.age}
                        onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                        placeholder="Your age"
                        className="w-full bg-muted/40 border border-card-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                        className="w-full bg-muted/40 border border-card-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select...</option>
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── View mode ── */
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="text-xl font-black">{profile.name}</h1>
                  <p className="text-muted-foreground text-sm mb-2">@{profile.username}</p>

                  {/* Age & Gender badges */}
                  {(displayAge || displayGender) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {displayAge && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                          <User className="w-3 h-3" /> {displayAge} yrs
                        </span>
                      )}
                      {displayGender && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 font-medium">
                          {displayGender}
                        </span>
                      )}
                    </div>
                  )}

                  {displayBio && (
                    <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{displayBio}</p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div className="text-center">
                      <p className="font-black text-lg">{profile.postCount}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg">{commentCount}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg">{likeCount}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {(profile.skills ?? []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill) => (
                          <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {(profile.interests ?? []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((interest) => (
                          <span key={interest} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">{interest}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Activity Tabs */}
        <div className="flex gap-1 bg-card border border-card-border rounded-xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs opacity-70 ml-0.5">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {postsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard key={post.id} post={post as any} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">No posts yet</p>
                  {isOwn && <p className="text-xs text-muted-foreground/60 mt-1">Share your first post on the feed</p>}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "comments" && (
            <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center py-14">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  {commentCount > 0
                    ? `${commentCount} comment${commentCount === 1 ? "" : "s"} made across the feed`
                    : "No comments yet"}
                </p>
                {isOwn && commentCount === 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-1">Join conversations on the feed</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "likes" && (
            <motion.div key="likes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center py-14">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  {likeCount > 0
                    ? `${likeCount} post${likeCount === 1 ? "" : "s"} liked`
                    : "No likes yet"}
                </p>
                {isOwn && likeCount === 0 && (
                  <p className="text-xs text-muted-foreground/60 mt-1">Like posts you enjoy on the feed</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
