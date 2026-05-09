import { motion } from "framer-motion";
import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getGetNotificationsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  mention: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  like: "text-rose-400 bg-rose-500/15",
  comment: "text-blue-400 bg-blue-500/15",
  follow: "text-green-400 bg-green-500/15",
  message: "text-purple-400 bg-purple-500/15",
  mention: "text-amber-400 bg-amber-500/15",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const handleMarkAll = async () => {
    await markAll.mutateAsync();
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
  };

  const handleMarkOne = async (id: number) => {
    await markOne.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
  };

  const unreadCount = (notifications ?? []).filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm px-2 py-0.5 rounded-full bg-primary text-white font-semibold">{unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (notifications ?? []).length > 0 ? (
          <div className="space-y-2">
            {(notifications ?? []).map((n, i) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell;
              const colorClass = TYPE_COLORS[n.type] ?? "text-gray-400 bg-gray-500/15";
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    n.isRead
                      ? "bg-card border-card-border opacity-70"
                      : "bg-card border-primary/20"
                  }`}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                >
                  <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you when something happens</p>
          </div>
        )}
      </div>
    </div>
  );
}
