import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const registerMutation = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await registerMutation.mutateAsync(form);
      login(result.token, result.user);
      navigate("/feed");
    } catch (err: any) {
      setError(err?.data?.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="GenZ Media X" className="w-12 h-12 object-contain" />
                <span className="font-black text-2xl gradient-text">GenZ Media X</span>
              </div>
            </Link>
            <h1 className="text-2xl font-black mb-1">Create account</h1>
            <p className="text-muted-foreground text-sm">Join the GenZ Media X community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "name", label: "Full Name", placeholder: "Your Name", type: "text" },
              { id: "username", label: "Username", placeholder: "yourusername", type: "text" },
              { id: "email", label: "Email", placeholder: "you@example.com", type: "email" },
              { id: "password", label: "Password", placeholder: "Minimum 6 characters", type: "password" },
            ].map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium">{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as any)[field.id]}
                  onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                  required
                  className="h-11 bg-muted/50 border-input"
                />
              </div>
            ))}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl glow-purple mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
