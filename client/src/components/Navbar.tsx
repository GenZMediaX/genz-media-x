import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Bookmark, MessageSquare, Search, Menu, X, Sun, Moon, Briefcase, Home, Grid3X3, LogOut, Settings, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", icon: <Home className="w-4 h-4" />, label: "Home" },
    { href: "/feed", icon: <Grid3X3 className="w-4 h-4" />, label: "Feed" },
    { href: "/work", icon: <Briefcase className="w-4 h-4" />, label: "Work" },
    { href: "/requirements", icon: <MessageSquare className="w-4 h-4" />, label: "Requirements" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass dark:glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="GenZ Media X" className="w-10 h-10 object-contain" />
            <span className="font-black text-lg tracking-tight hidden sm:block gradient-text">GenZ Media X</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-sm font-medium"
                >
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-48 h-8 text-sm"
                />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/bookmarks">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg hidden group-hover:block">
                    <div className="p-2 space-y-1">
                      <Link href={`/profile/${user.id}`}>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                          <User className="w-4 h-4" /> Profile
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                          <Settings className="w-4 h-4" /> Settings
                        </Button>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Button>
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive" onClick={logout}>
                          <LogOut className="w-4 h-4" /> Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-sm bg-primary hover:bg-primary/90">Join Free</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  {link.icon} {link.label}
                </Button>
              </Link>
            ))}
            {user && (
              <>
                <Link href="/notifications" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Bell className="w-4 h-4" /> Notifications
                  </Button>
                </Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" /> Messages
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
