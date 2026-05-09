import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/contexts/AuthContext";

const API_BASE = "/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export { apiFetch };

// --- Auth ---
export const useLoginUser = () => useMutation({ mutationFn: (body: { email: string; password: string }) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }) });
export const useRegisterUser = () => useMutation({ mutationFn: (body: { username: string; email: string; password: string; name: string }) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }) });
export const useGetCurrentUser = (opts?: any) => useQuery({ queryKey: ["currentUser"], queryFn: () => apiFetch("/auth/me"), ...opts });
export const getGetCurrentUserQueryKey = () => ["currentUser"];

// --- Users ---
export const useGetUser = (userId: number, opts?: any) => useQuery({ queryKey: ["user", userId], queryFn: () => apiFetch(`/users/${userId}`), enabled: !!userId, ...opts });
export const useUpdateUserProfile = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ userId, data }: { userId: number; data: any }) => apiFetch(`/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["currentUser"] }); } }); };

// --- Posts ---
export const useGetPosts = (params: any, opts?: any) => { const search = new URLSearchParams(); if (params?.category) search.set("category", params.category); if (params?.search) search.set("search", params.search); if (params?.page) search.set("page", String(params.page)); return useQuery({ queryKey: ["posts", params], queryFn: () => apiFetch(`/posts?${search}`), ...opts }); };
export const useGetPost = (postId: number, opts?: any) => useQuery({ queryKey: ["post", postId], queryFn: () => apiFetch(`/posts/${postId}`), enabled: !!postId, ...opts });
export const useCreatePost = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (body: any) => apiFetch("/posts", { method: "POST", body: JSON.stringify(body) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); } }); };
export const useDeletePost = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (postId: number) => apiFetch(`/posts/${postId}`, { method: "DELETE" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); } }); };
export const useLikePost = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (postId: number) => apiFetch(`/posts/${postId}/like`, { method: "POST" }), onSuccess: (_d, postId) => { qc.invalidateQueries({ queryKey: ["post", postId] }); qc.invalidateQueries({ queryKey: ["posts"] }); } }); };
export const useBookmarkPost = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (postId: number) => apiFetch(`/posts/${postId}/bookmark`, { method: "POST" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); qc.invalidateQueries({ queryKey: ["bookmarks"] }); } }); };
export const getGetPostsQueryKey = (params?: any) => ["posts", params];
export const getGetPostQueryKey = (postId: number) => ["post", postId];

// --- Comments ---
export const useGetComments = (postId: number, opts?: any) => useQuery({ queryKey: ["comments", postId], queryFn: () => apiFetch(`/posts/${postId}/comments`), enabled: !!postId, ...opts });
export const useCreateComment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ postId, content }: { postId: number; content: string }) => apiFetch(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) }), onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["comments", v.postId] }); qc.invalidateQueries({ queryKey: ["post", v.postId] }); } }); };
export const getGetCommentsQueryKey = (postId: number) => ["comments", postId];

// --- Categories ---
export const useGetCategories = (opts?: any) => useQuery({ queryKey: ["categories"], queryFn: () => apiFetch("/categories"), ...opts });
export const getGetCategoriesQueryKey = () => ["categories"];

// --- Trending / Feed ---
export const useGetTrending = (opts?: any) => useQuery({ queryKey: ["trending"], queryFn: () => apiFetch("/trending"), ...opts });
export const useGetFeedSummary = (opts?: any) => useQuery({ queryKey: ["feedSummary"], queryFn: () => apiFetch("/feed/summary"), ...opts });
export const getGetTrendingQueryKey = () => ["trending"];
export const getGetFeedSummaryQueryKey = () => ["feedSummary"];

// --- Bookmarks ---
export const useGetBookmarks = (opts?: any) => useQuery({ queryKey: ["bookmarks"], queryFn: () => apiFetch("/bookmarks"), ...opts });
export const getGetBookmarksQueryKey = () => ["bookmarks"];

// --- Notifications ---
export const useGetNotifications = (opts?: any) => useQuery({ queryKey: ["notifications"], queryFn: () => apiFetch("/notifications"), ...opts });
export const useMarkNotificationRead = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => apiFetch(`/notifications/${id}/read`, { method: "PUT" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); } }); };
export const useMarkAllNotificationsRead = () => { const qc = useQueryClient(); return useMutation({ mutationFn: () => apiFetch("/notifications/read-all", { method: "PUT" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); } }); };
export const getGetNotificationsQueryKey = () => ["notifications"];

// --- Requirements ---
export const useGetRequirements = (params?: any, opts?: any) => { const search = new URLSearchParams(); if (params?.status) search.set("status", params.status); return useQuery({ queryKey: ["requirements", params], queryFn: () => apiFetch(`/requirements?${search}`), ...opts }); };
export const useCreateRequirement = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (body: any) => apiFetch("/requirements", { method: "POST", body: JSON.stringify(body) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["requirements"] }); } }); };
export const useUpdateRequirement = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/requirements/${id}`, { method: "PUT", body: JSON.stringify(data) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["requirements"] }); } }); };
export const getGetRequirementsQueryKey = (params?: any) => ["requirements", params];

// --- Messages ---
export const useGetConversations = (opts?: any) => useQuery({ queryKey: ["conversations"], queryFn: () => apiFetch("/messages"), ...opts });
export const useGetMessages = (conversationId: number, opts?: any) => useQuery({ queryKey: ["messages", conversationId], queryFn: () => apiFetch(`/messages/${conversationId}`), enabled: !!conversationId, ...opts });
export const useSendMessage = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) => apiFetch(`/messages/${conversationId}`, { method: "POST", body: JSON.stringify({ content }) }), onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["messages", v.conversationId] }); qc.invalidateQueries({ queryKey: ["conversations"] }); } }); };
export const getGetConversationsQueryKey = () => ["conversations"];
export const getGetMessagesQueryKey = (conversationId: number) => ["messages", conversationId];

// --- Work ---
export const useGetPortfolio = (opts?: any) => useQuery({ queryKey: ["portfolio"], queryFn: () => apiFetch("/work/portfolio"), ...opts });
export const useGetServices = (opts?: any) => useQuery({ queryKey: ["services"], queryFn: () => apiFetch("/work/services"), ...opts });
export const useGetTestimonials = (opts?: any) => useQuery({ queryKey: ["testimonials"], queryFn: () => apiFetch("/work/testimonials"), ...opts });
export const useSubmitContactForm = () => useMutation({ mutationFn: (body: any) => apiFetch("/work/contact", { method: "POST", body: JSON.stringify(body) }) });
export const getGetPortfolioQueryKey = () => ["portfolio"];
export const getGetServicesQueryKey = () => ["services"];
export const getGetTestimonialsQueryKey = () => ["testimonials"];

// --- Admin ---
export const useAdminGetStats = (opts?: any) => useQuery({ queryKey: ["adminStats"], queryFn: () => apiFetch("/admin/stats"), ...opts });
export const useAdminGetUsers = (params?: any, opts?: any) => { const search = new URLSearchParams(); if (params?.page) search.set("page", String(params.page)); return useQuery({ queryKey: ["adminUsers", params], queryFn: () => apiFetch(`/admin/users?${search}`), ...opts }); };
export const useAdminGetPosts = (params?: any, opts?: any) => { const search = new URLSearchParams(); if (params?.page) search.set("page", String(params.page)); return useQuery({ queryKey: ["adminPosts", params], queryFn: () => apiFetch(`/admin/posts?${search}`), ...opts }); };
export const useAdminFeaturePost = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (postId: number) => apiFetch(`/admin/posts/${postId}/feature`, { method: "PUT" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminPosts"] }); qc.invalidateQueries({ queryKey: ["posts"] }); } }); };
export const useAdminDeleteUser = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (userId: number) => apiFetch(`/admin/users/${userId}`, { method: "DELETE" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["adminUsers"] }); } }); };
export const getAdminGetStatsQueryKey = () => ["adminStats"];
export const getAdminGetUsersQueryKey = (params?: any) => ["adminUsers", params];
export const getAdminGetPostsQueryKey = (params?: any) => ["adminPosts", params];

// --- User posts ---
export const useGetUserPosts = (userId: number, opts?: any) => useQuery({ queryKey: ["userPosts", userId], queryFn: () => apiFetch(`/posts?authorId=${userId}`), enabled: !!userId, ...opts });
