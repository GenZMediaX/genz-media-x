import { useState } from "react";
import { motion } from "framer-motion";
import { useGetRequirements, useCreateRequirement, useUpdateRequirement, getGetRequirementsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, X, Loader2, ClipboardList, CheckCircle, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RequirementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const params: any = { status: statusFilter };
  const { data: requirements, isLoading } = useGetRequirements(params);
  const createMutation = useCreateRequirement();
  const updateMutation = useUpdateRequirement();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    queryClient.invalidateQueries({ queryKey: getGetRequirementsQueryKey() });
    setForm({ title: "", description: "" });
    setShowCreate(false);
  };

  const handleToggleStatus = async (req: any) => {
    const newStatus = req.status === "open" ? "closed" : "open";
    await updateMutation.mutateAsync({ id: req.id, data: { status: newStatus } });
    queryClient.invalidateQueries({ queryKey: getGetRequirementsQueryKey() });
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Requirements Board
            </h1>
            <p className="text-muted-foreground text-sm">Post your needs, find solutions</p>
          </div>
          {user && (
            <Button onClick={() => setShowCreate(s => !s)} className="bg-primary hover:bg-primary/90 gap-2">
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? "Cancel" : "Post Requirement"}
            </Button>
          )}
        </div>

        {/* Create form */}
        {showCreate && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card border border-card-border rounded-xl p-5 mb-6"
          >
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="What do you need?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe your requirement in detail..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                  className="bg-muted/30 min-h-[100px]"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post Requirement
              </Button>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "open", "closed"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Requirements list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (requirements ?? []).length > 0 ? (
          <div className="space-y-4">
            {(requirements ?? []).map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-card-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        req.status === "open"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-gray-500/15 text-gray-400"
                      }`}>
                        {req.status === "open" ? <Circle className="w-2.5 h-2.5" /> : <CheckCircle className="w-2.5 h-2.5" />}
                        {req.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{req.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>By {req.author.name}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
                      <span>·</span>
                      <span>{req.responseCount} responses</span>
                    </div>
                  </div>
                  {user && user.id === req.authorId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => handleToggleStatus(req)}
                    >
                      {req.status === "open" ? "Close" : "Reopen"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No requirements found</p>
            <p className="text-sm mt-1">Be the first to post a requirement!</p>
          </div>
        )}
      </div>
    </div>
  );
}
