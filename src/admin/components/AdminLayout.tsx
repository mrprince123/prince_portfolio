import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import {
  LayoutDashboard,
  Mail,
  FolderGit2,
  FileText,
  GraduationCap,
  Cpu,
  BookOpen,
  MessageSquareQuote,
  Youtube,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Shield,
  Activity,
  Sun,
  Moon,
  MoreHorizontal,
  Sparkles,
  Lightbulb,
  Calendar,
  Share2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import princelogo from "@/assets/princesahni-logo.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "contacts";
}

const publishingNavItems: NavItem[] = [
  { label: "AI Studio", href: "/admin/publishing/studio", icon: Sparkles },
  { label: "Ideas Vault", href: "/admin/publishing/ideas", icon: Lightbulb },
  { label: "Publish Queue", href: "/admin/publishing/calendar", icon: Calendar },
  { label: "Platforms", href: "/admin/publishing/platforms", icon: Share2 },
  { label: "Audit Logs", href: "/admin/publishing/logs", icon: Clock },
];

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Inquiries", href: "/admin/contacts", icon: Mail, badgeKey: "contacts" },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Blog Posts", href: "/admin/blogs", icon: FileText },
  { label: "Courses", href: "/admin/courses", icon: GraduationCap },
  { label: "Skills", href: "/admin/skills", icon: Cpu },
  { label: "Articles", href: "/admin/articles", icon: BookOpen },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "YouTube Videos", href: "/admin/youtube", icon: Youtube },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const mobilePrimaryTabs = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Inquiries", href: "/admin/contacts", icon: Mail, badgeKey: "contacts" as const },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
];

const mobileSecondaryItems = [
  { label: "AI Studio", href: "/admin/publishing/studio", icon: Sparkles, desc: "Multi-Platform AI Drafts" },
  { label: "Ideas Vault", href: "/admin/publishing/ideas", icon: Lightbulb, desc: "Brainstorming Bank" },
  { label: "Publish Queue", href: "/admin/publishing/calendar", icon: Calendar, desc: "Scheduled Posts" },
  { label: "Platforms", href: "/admin/publishing/platforms", icon: Share2, desc: "LinkedIn, Medium, Bot" },
  { label: "Audit Logs", href: "/admin/publishing/logs", icon: Clock, desc: "Execution Telemetry" },
  { label: "Courses", href: "/admin/courses", icon: GraduationCap, desc: "Curricula & Modules" },
  { label: "Skills", href: "/admin/skills", icon: Cpu, desc: "Tech Stack & Domains" },
  { label: "Articles", href: "/admin/articles", icon: BookOpen, desc: "Medium Publications" },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, desc: "Recommendations" },
  { label: "YouTube", href: "/admin/youtube", icon: Youtube, desc: "Video Tutorials" },
  { label: "Settings", href: "/admin/settings", icon: Settings, desc: "Security & API Config" },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin", "overview-stats"],
    queryFn: () => adminApi.overview.getStats(),
    refetchInterval: 60000,
    retry: 1,
  });

  const pendingContacts = stats?.counts?.contacts?.pending ?? 0;

  const allNavItems = [...publishingNavItems, ...navItems];

  const currentRouteItem = allNavItems.find((item) =>
    location.pathname.startsWith(item.href)
  );

  const isMoreActive = mobileSecondaryItems.some((item) =>
    location.pathname.startsWith(item.href)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      {/* Desktop Sidebar (lg:flex, hidden on mobile for native app feel) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-card/60 backdrop-blur-xl shrink-0">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link to="/admin/overview" className="flex items-center gap-2.5">
            <img
              src={princelogo}
              alt="Prince Sahni Logo"
              className="h-8 w-8 rounded-lg object-cover border border-border/50 shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">Admin Console</span>
              <span className="text-[10px] text-muted-foreground font-mono">Prince Sahni CMS</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* AI Publishing Section */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 flex items-center justify-between">
              <span>AI Publishing</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-sans font-medium">Free Tier</span>
            </div>
            <nav className="space-y-1">
              {publishingNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Portfolio CMS Section */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
              Content & Site
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                const badgeCount = item.badgeKey === "contacts" ? pendingContacts : 0;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {badgeCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 px-1.5 text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      >
                        {badgeCount}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card */}
        <div className="border-t border-border/60 p-3 bg-muted/20">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold">
                {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium truncate">{user?.username || "Admin"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email || "admin@example.com"}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              title="Sign Out"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/85 px-4 sm:px-6 backdrop-blur-xl">
          {/* Desktop Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {currentRouteItem?.label || "Console"}
            </span>
          </div>

          {/* Mobile App Bar Header */}
          <div className="flex lg:hidden items-center gap-2.5">
            <img
              src={princelogo}
              alt="Prince Sahni Logo"
              className="h-7 w-7 rounded-lg object-cover border border-border/50 shadow-xs"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-foreground">
                {currentRouteItem?.label || "Admin Console"}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats?.systemInfo?.dbStatus ? `DB: ${stats.systemInfo.dbStatus}` : "DB: Connected"}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex h-8 text-xs gap-1.5 border-border/60 hover:bg-secondary/60"
              asChild
            >
              <a href="/" target="_blank" rel="noreferrer">
                <span>View Public Site</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full active:scale-95 transition-transform">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-semibold ring-1 ring-border/50">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium leading-none">{user?.username || "Admin"}</p>
                    <p className="text-[11px] leading-none text-muted-foreground">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  <span>Settings & Configuration</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/overview")}>
                  <Activity className="mr-2 h-3.5 w-3.5" />
                  <span>System Diagnostics</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/" target="_blank" rel="noreferrer" className="flex items-center">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    <span>View Public Site</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Viewport with Bottom Padding for Mobile Navigation Bar */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/70 bg-card/90 backdrop-blur-2xl px-2 py-1 shadow-lg pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="grid grid-cols-5 items-center justify-around">
          {mobilePrimaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            const badgeCount = item.badgeKey === "contacts" ? pendingContacts : 0;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 transition-all active:scale-90 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                      isActive ? "bg-primary/10 shadow-xs" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white shadow-xs">
                      {badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}

          {/* "More" / Secondary Menu Tab */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1.5 transition-all active:scale-90 ${
              isMoreActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  isMoreActive ? "bg-primary/10 shadow-xs" : ""
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
              {isMoreActive && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Bottom Sheet Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 max-h-[85vh] overflow-y-auto border-t border-border/80 bg-card/95 backdrop-blur-2xl"
        >
          {/* iOS grab handle */}
          <div className="pt-3 pb-1 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>

          <SheetHeader className="px-5 pb-3 border-b border-border/60 text-left">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-sm font-bold tracking-tight">Navigation & Modules</SheetTitle>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {user?.username || "Admin"} • {user?.email || "admin@example.com"}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                Superadmin
              </Badge>
            </div>
          </SheetHeader>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {mobileSecondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.href);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                      isActive
                        ? "border-primary/50 bg-primary/10 text-foreground font-semibold shadow-xs"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-1.5 justify-center border-border/60"
                  asChild
                >
                  <a href="/" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Public Site</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 text-xs gap-1.5 justify-center border-border/60"
                >
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full h-9 text-xs gap-1.5 justify-center"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of Console</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
