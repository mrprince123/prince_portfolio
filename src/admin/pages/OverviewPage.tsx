import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  FileText,
  Mail,
  GraduationCap,
  Cpu,
  BookOpen,
  MessageSquareQuote,
  Youtube,
  ArrowUpRight,
  Clock,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const OverviewPage: React.FC = () => {
  const { data: stats, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "overview-full"],
    queryFn: () => adminApi.overview.getStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/40 p-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="text-sm font-semibold">Failed to fetch overview analytics</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {error instanceof Error ? error.message : "Ensure the backend server is running on port 5001."}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4 gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const { counts, recentContacts, recentBlogs, recentProjects, systemInfo } = stats;

  const statCards = [
    {
      title: "Projects",
      value: counts.projects.total,
      subtext: `${counts.projects.visible} visible on portfolio`,
      icon: FolderGit2,
      href: "/admin/projects",
      color: "text-blue-500",
    },
    {
      title: "Inquiries",
      value: counts.contacts.total,
      subtext: `${counts.contacts.pending} pending replies`,
      icon: Mail,
      href: "/admin/contacts",
      color: counts.contacts.pending > 0 ? "text-amber-500" : "text-emerald-500",
    },
    {
      title: "Blog Posts",
      value: counts.blogs.total,
      subtext: `${counts.blogs.visible} published articles`,
      icon: FileText,
      href: "/admin/blogs",
      color: "text-purple-500",
    },
    {
      title: "Courses",
      value: counts.courses.total,
      subtext: "Interactive curricula",
      icon: GraduationCap,
      href: "/admin/courses",
      color: "text-emerald-500",
    },
    {
      title: "Skill Categories",
      value: counts.skills.total,
      subtext: "Tech stack domains",
      icon: Cpu,
      href: "/admin/skills",
      color: "text-cyan-500",
    },
    {
      title: "Medium Articles",
      value: counts.articles.total,
      subtext: "External publications",
      icon: BookOpen,
      href: "/admin/articles",
      color: "text-indigo-500",
    },
    {
      title: "Testimonials",
      value: counts.testimonials.total,
      subtext: "Client recommendations",
      icon: MessageSquareQuote,
      href: "/admin/testimonials",
      color: "text-rose-500",
    },
    {
      title: "YouTube Videos",
      value: counts.youtubes.total,
      subtext: "Video tutorials & demos",
      icon: Youtube,
      href: "/admin/youtube",
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Overview</h1>
          <p className="text-xs text-muted-foreground">
            Live telemetry and content state synchronized with MongoDB Atlas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs gap-1.5 border-border/60"
          >
            <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.href}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-xl transition-all hover:border-border hover:bg-card/90 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{card.title}</span>
                <div className={`rounded-lg p-1 sm:p-1.5 bg-secondary/50 shrink-0 ${card.color}`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight">{card.value}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-muted-foreground truncate">{card.subtext}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Recent Inquiries</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground">
              <Link to="/admin/contacts">View all ({counts.contacts.total})</Link>
            </Button>
          </div>
          <div className="divide-y divide-border/50">
            {recentContacts && recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-start justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{contact.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        &lt;{contact.email}&gt;
                      </span>
                      {contact.isReplied ? (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        >
                          Replied
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        >
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground font-medium">{contact.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{contact.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recent contact inquiries received yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Server className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">System Diagnostics</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" /> Database
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{systemInfo.dbName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Connection State</span>
              <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                {systemInfo.dbStatus}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-mono text-xs uppercase">{systemInfo.nodeEnv}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Uptime
              </span>
              <span className="font-mono text-xs">
                {Math.floor(systemInfo.uptimeSeconds / 60)}m {systemInfo.uptimeSeconds % 60}s
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Registered Users</span>
              <span className="font-mono text-xs">{counts.users.total}</span>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-2">
            <span className="text-[11px] font-medium text-muted-foreground">Quick Management</span>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild className="h-8 text-xs justify-start border-border/60">
                <Link to="/admin/projects">
                  <FolderGit2 className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                  Projects
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs justify-start border-border/60">
                <Link to="/admin/blogs">
                  <FileText className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                  Blogs
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs justify-start border-border/60">
                <Link to="/admin/courses">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  Courses
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs justify-start border-border/60">
                <Link to="/admin/settings">
                  <Server className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Config
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

