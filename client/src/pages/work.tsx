import { useState } from "react";
import { motion } from "framer-motion";
import { useGetPortfolio, useGetServices, useGetTestimonials, useSubmitContactForm } from "@/lib/api";
import { getGetPortfolioQueryKey, getGetServicesQueryKey, getGetTestimonialsQueryKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, Video, Share2, Camera, TrendingUp, CheckCircle, Loader2, Play } from "lucide-react";

const ICON_MAP: Record<string, any> = { Video, Share2, Camera, TrendingUp, Briefcase: Video };

const GRADIENT_CARDS = [
  "from-violet-600 to-purple-800",
  "from-blue-600 to-indigo-800",
  "from-pink-600 to-rose-800",
  "from-amber-600 to-orange-800",
];

export default function WorkPage() {
  const { data: portfolio } = useGetPortfolio();
  const { data: services } = useGetServices();
  const { data: testimonials } = useGetTestimonials();
  const submitForm = useSubmitContactForm();

  const [form, setForm] = useState({ name: "", email: "", requirement: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await submitForm.mutateAsync(form);
      setSubmitted(true);
      setForm({ name: "", email: "", requirement: "", phone: "" });
    } catch {
      setError("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 mb-6 uppercase tracking-wider">
              Available for Work
            </span>
            <h1 className="text-5xl sm:text-6xl font-black mb-4 gradient-text">GenZ Media X</h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Premium digital services for brands that want to stand out. Video editing, social media management, and content creation that converts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/message/genzMediaX" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 font-semibold rounded-xl gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Hire Me on WhatsApp
                </Button>
              </a>
              <a href="#contact">
                <Button size="lg" variant="outline" className="px-8 h-12 font-semibold rounded-xl">
                  Contact Form
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Services</h2>
          <p className="text-center text-muted-foreground mb-10">What I offer to grow your brand</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(services ?? []).map((service, i) => {
              const Icon = ICON_MAP[service.icon] ?? Video;
              const gradient = GRADIENT_CARDS[i % GRADIENT_CARDS.length];
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/40 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-1">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                  <p className="text-sm font-semibold text-primary mb-3">{service.price}</p>
                  <ul className="space-y-1.5">
                    {service.features.slice(0, 4).map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Portfolio</h2>
          <p className="text-center text-muted-foreground mb-10">Recent work that speaks for itself</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(portfolio ?? []).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-card-border bg-card"
              >
                <div
                  className="h-44 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${["#7C3AED","#4F46E5","#DB2777","#D97706"][i % 4]}30, ${["#4F46E5","#06B6D4","#7C3AED","#DB2777"][i % 4]}30)`
                  }}
                >
                  {item.videoUrl ? (
                    <Play className="w-10 h-10 text-white/70" />
                  ) : (
                    <Camera className="w-10 h-10 text-white/70" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    {item.isFeatured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Featured</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {(testimonials ?? []).length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-2">What Clients Say</h2>
            <p className="text-center text-muted-foreground mb-10">Real results for real clients</p>
            <div className="grid md:grid-cols-2 gap-4">
              {(testimonials ?? []).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-card-border rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed mb-4">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section id="contact" className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-black text-center mb-2">Get in Touch</h2>
          <p className="text-center text-muted-foreground mb-8">Tell me about your project</p>

          {submitted ? (
            <div className="text-center py-10 bg-card border border-card-border rounded-2xl">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Message Sent!</h3>
              <p className="text-muted-foreground text-sm mt-1">I'll get back to you within 24 hours.</p>
              <Button className="mt-4 bg-primary" onClick={() => setSubmitted(false)}>Send Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Your Requirement *</Label>
                <Textarea placeholder="Describe your project..." value={form.requirement} onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))} required className="bg-muted/30 min-h-[100px]" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 gap-2" disabled={submitForm.isPending}>
                  {submitForm.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Message"}
                </Button>
                <a href="https://wa.me/message/genzMediaX" target="_blank" rel="noopener noreferrer">
                  <Button type="button" className="bg-green-600 hover:bg-green-700 gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
