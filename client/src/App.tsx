import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import FeedPage from "@/pages/feed";
import CategoryPage from "@/pages/category";
import PostPage from "@/pages/post";
import ProfilePage from "@/pages/profile";
import WorkPage from "@/pages/work";
import RequirementsPage from "@/pages/requirements";
import MessagesPage from "@/pages/messages";
import NotificationsPage from "@/pages/notifications";
import BookmarksPage from "@/pages/bookmarks";
import AdminPage from "@/pages/admin";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/feed" component={FeedPage} />
        <Route path="/category/:id" component={CategoryPage} />
        <Route path="/post/:id" component={PostPage} />
        <Route path="/profile/:userId" component={ProfilePage} />
        <Route path="/work" component={WorkPage} />
        <Route path="/requirements" component={RequirementsPage} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/bookmarks" component={BookmarksPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
