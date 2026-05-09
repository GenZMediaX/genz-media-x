import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Users, TrendingUp, Plane, Sparkles, Share2, BookOpen, Camera, Video, HeartPulse, MapPin, Building, Landmark, ClipboardList, ChevronDown, User, X, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetFeedSummary, useGetTrending, useGetCategories } from "@/lib/api";
import { getGetFeedSummaryQueryKey, getGetTrendingQueryKey, getGetCategoriesQueryKey } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { RiWhatsappFill, RiTelegramFill, RiInstagramFill, RiYoutubeFill, RiTwitterXFill } from "react-icons/ri";

const ICONS: Record<string, any> = {
  Plane, Sparkles, Share2, BookOpen, Briefcase, ClipboardList,
  MapPin, Building, Landmark, HeartPulse, Video, Camera
};

const GRADIENT_PRESETS = [
  "from-violet-600 to-purple-800",
  "from-blue-600 to-indigo-800",
  "from-pink-600 to-rose-800",
  "from-amber-600 to-orange-800",
  "from-green-600 to-emerald-800",
  "from-cyan-600 to-teal-800",
  "from-fuchsia-600 to-pink-800",
  "from-red-600 to-rose-800",
  "from-yellow-600 to-amber-800",
  "from-indigo-600 to-violet-800",
  "from-purple-600 to-fuchsia-800",
  "from-teal-600 to-cyan-800",
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export default function HomePage() {
  const [, navigate] = useLocation();
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectView, setConnectView] = useState<"main" | "community" | "owner">("main");

  const { data: summary } = useGetFeedSummary();
  const { data: trending } = useGetTrending();
  const { data: categories } = useGetCategories();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 mb-6 tracking-wider uppercase">
              Create. Connect. Grow. Earn.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="flex justify-center mb-4"
          >
            <img src="/logo.png" alt="GenZ Media X Logo" className="w-32 h-32 sm:w-40 sm:h-40 object-contain" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-6"
          >
            <span className="gradient-text">GenZ</span>{" "}
            <span className="text-foreground">Media</span>
            <span className="gradient-text">X</span>{" "}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A premium platform for learners, creators, freelancers, travellers, Vloggers,  
            entrepreneurs, and community builders.
            Share your journey, Share your view, Find & Create opportunities, and grow together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/feed">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base font-semibold rounded-xl glow-purple transition-all duration-200 hover:scale-105">
                Explore Feed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/work">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base font-semibold rounded-xl border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
                Know about Me
                <Briefcase className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          {summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { label: "Total Posts", value: summary.totalPosts.toLocaleString() },
                { label: "Active Members", value: summary.totalUsers.toLocaleString() },
                { label: "Categories", value: summary.totalCategories.toString() },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black gradient-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-muted-foreground/50 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-3">Explore Categories</h2>
            <p className="text-muted-foreground text-lg">Dive into communities that match your vibe</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {(categories ?? []).map((cat, i) => {
              const Icon = ICONS[cat.icon] ?? Grid3X3;
              const gradient = GRADIENT_PRESETS[i % GRADIENT_PRESETS.length];
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link href={`/category/${cat.id}`}>
                    <div className="group relative overflow-hidden rounded-2xl p-6 border border-border hover:border-primary/40 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-sm mb-1 leading-tight">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">{cat.postCount} posts</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {summary?.featuredPosts && summary.featuredPosts.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-3xl font-black mb-1">Featured Posts</h2>
                <p className="text-muted-foreground">Handpicked content from our community</p>
              </div>
              <Link href="/feed">
                <Button variant="outline" size="sm" className="gap-2">
                  See All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-4">
              {summary.featuredPosts.slice(0, 4).map(post => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending?.posts && trending.posts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-primary" />
                  Trending Now
                </h2>
                <p className="text-muted-foreground">Meet, Collect, Grow, Earn with Communities</p>
              </div>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.posts.slice(0, 6).map(post => (
                <PostCard key={post.id} post={post as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 border border-primary/20"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.1) 100%)" }}
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4 gradient-text">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground mb-8">Join thousands of persons who are building their digital presence</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-12 font-semibold rounded-xl glow-purple">
                    Join the Community
                  </Button>
                </Link>
                <Link href="/work">
                  <Button size="lg" variant="outline" className="px-8 h-12 font-semibold rounded-xl">
                    Connect with Our Team
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Connect with our Team */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black mb-2">Connect with Our Team</h2>
            <p className="text-muted-foreground mb-8">Choose how you'd like to reach us</p>

            {!connectOpen ? (
              <button
                onClick={() => setConnectOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary/15 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-all duration-200 hover:scale-105 glow-purple"
              >
                <Users className="w-5 h-5" />
                Connect with Our Team
                <ChevronDown className="w-5 h-5" />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Two main options */}
                {connectView === "main" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setConnectView("community")}
                      className="group p-6 rounded-2xl bg-card border border-card-border hover:border-primary/40 text-left transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-base mb-1">Connect with Community</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Join our vibrant communities across different platforms</p>
                    </button>
                    <button
                      onClick={() => setConnectView("owner")}
                      className="group p-6 rounded-2xl bg-card border border-card-border hover:border-primary/40 text-left transition-all duration-200 hover:-translate-y-1"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-base mb-1">Connect with Owner</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Reach out directly to the founder of GenZ Media X</p>
                    </button>
                  </div>
                )}

                {/* Community section */}
                {connectView === "community" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-card border border-card-border rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Community Links
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { name: "WhatsApp Community", icon: RiWhatsappFill, color: "#25D366", bg: "bg-[#25D366]/15", href: "#" },
                          { name: "Telegram Group", icon: RiTelegramFill, color: "#2AABEE", bg: "bg-[#2AABEE]/15", href: "#" },
                          { name: "Instagram Group", icon: RiInstagramFill, color: "#E1306C", bg: "bg-[#E1306C]/15", href: "#" },
                          { name: "YouTube Channel", icon: RiYoutubeFill, color: "#FF0000", bg: "bg-[#FF0000]/15", href: "#" },
                          { name: "Twitter / X", icon: RiTwitterXFill, color: "#fff", bg: "bg-white/10", href: "#" },
                        ].map(item => (
                          <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${item.bg} border border-white/5 hover:scale-105 transition-all duration-200`}
                          >
                            <item.icon style={{ color: item.color }} className="w-8 h-8" />
                            <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Owner section */}
                {connectView === "owner" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-card border border-card-border rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Owner's Direct Links
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { name: "WhatsApp", icon: RiWhatsappFill, color: "#25D366", bg: "bg-[#25D366]/15", href: "https://wa.me/916388569536", label: "Chat Now" },
                          { name: "Telegram", icon: RiTelegramFill, color: "#2AABEE", bg: "bg-[#2AABEE]/15", href: "https://t.me/GenZMediaX", label: "Message" },
                          { name: "Instagram", icon: RiInstagramFill, color: "#E1306C", bg: "bg-[#E1306C]/15", href: "https://www.instagram.com/genzmediax", label: "Follow" },
                          { name: "YouTube", icon: RiYoutubeFill, color: "#FF0000", bg: "bg-[#FF0000]/15", href: "https://youtube.com/@genzmediax", label: "Subscribe" },
                          { name: "Twitter / X", icon: RiTwitterXFill, color: "#fff", bg: "bg-white/10", href: "https://x.com/GenZMediaX", label: "Follow" },
                        ].map(item => (
                          <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${item.bg} border border-white/5 hover:scale-105 transition-all duration-200 group`}
                          >
                            <item.icon style={{ color: item.color }} className="w-8 h-8" />
                            <span className="text-xs font-bold">{item.name}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Nav buttons */}
                <div className="flex justify-center gap-3 pt-2">
                  {connectView !== "main" && (
                    <button
                      onClick={() => setConnectView("main")}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" /> Back
                    </button>
                  )}
                  <button
                    onClick={() => { setConnectOpen(false); setConnectView("main"); }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" /> Close
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GenZ Media X" className="w-10 h-10 object-contain" />
              <div>
                <p className="font-black gradient-text">GenZ Media X</p>
                <p className="text-xs text-muted-foreground">Create. Connect. Grow.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/feed" className="hover:text-foreground transition-colors">Feed</Link>
              <Link href="/work" className="hover:text-foreground transition-colors">Work</Link>
              <Link href="/requirements" className="hover:text-foreground transition-colors">Requirements</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Join</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2024 GenZ Media X. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

