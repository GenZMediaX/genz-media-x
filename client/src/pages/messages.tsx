import { useState } from "react";
import { useGetConversations, useGetMessages, useSendMessage, getGetConversationsQueryKey, getGetMessagesQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const { data: conversations, isLoading: convsLoading } = useGetConversations();
  const { data: messages, isLoading: msgsLoading } = useGetMessages(selectedConv ?? 0, { enabled: !!selectedConv });
  const sendMessage = useSendMessage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConv) return;
    await sendMessage.mutateAsync({ conversationId: selectedConv, content: message });
    queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedConv) });
    setMessage("");
  };

  const selectedConvData = (conversations ?? []).find(c => c.id === selectedConv);

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Conversation list */}
        <div className="w-full md:w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h1 className="font-black text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Messages
            </h1>
          </div>
          {convsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (conversations ?? []).length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {(conversations ?? []).map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/50 transition-colors text-left ${
                    selectedConv === conv.id ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {conv.participant.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{conv.participant.name}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No conversations yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 hidden md:flex flex-col">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {selectedConvData?.participant.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedConvData?.participant.name}</p>
                  <p className="text-xs text-muted-foreground">@{selectedConvData?.participant.username}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (messages ?? []).map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isMe ? "bg-primary text-white rounded-br-sm" : "bg-card border border-card-border rounded-bl-sm"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(messages ?? []).length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">Start the conversation!</p>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="flex-1 bg-muted/30"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={sendMessage.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
