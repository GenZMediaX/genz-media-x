import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUpdateUserProfile, getGetCurrentUserQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, CheckCircle, Loader2, Plus, X } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateUserProfile();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
    skills: [] as string[],
    interests: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        bio: user.bio ?? "",
        avatarUrl: user.avatarUrl ?? "",
        skills: user.skills ?? [],
        interests: user.interests ?? [],
      });
    }
  }, [user]);

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !form.interests.includes(interestInput.trim())) {
      setForm(f => ({ ...f, interests: [...f.interests, interestInput.trim()] }));
      setInterestInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateMutation.mutateAsync({ userId: user!.id, data: form });

      queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.data?.error ?? "Failed to update profile");
    }
  };

  if (!user) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <p className="text-muted-foreground">Please log in to access settings</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">Profile Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-card-border rounded-2xl p-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-muted/30" />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell the community about yourself..."
              className="bg-muted/30 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={form.avatarUrl}
              onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://..."
              className="bg-muted/30"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                placeholder="Add a skill..."
                className="bg-muted/30"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
                  {skill}
                  <button type="button" onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                placeholder="Add an interest..."
                className="bg-muted/30"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
              />
              <Button type="button" variant="outline" onClick={addInterest} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.interests.map(interest => (
                <span key={interest} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                  {interest}
                  <button type="button" onClick={() => setForm(f => ({ ...f, interests: f.interests.filter(i => i !== interest) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
