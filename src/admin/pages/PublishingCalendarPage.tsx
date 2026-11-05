import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { PublishingJob } from "../types";
import {
  Calendar,
  Clock,
  Play,
  RotateCw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Share2,
  Globe,
  FileText,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const PublishingCalendarPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("all");
  const [rescheduleJobId, setRescheduleJobId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "publishing-jobs", statusFilter],
    queryFn: () => adminApi.publishing.getJobs(statusFilter),
    refetchInterval: 30000,
  });

  const triggerCronMutation = useMutation({
    mutationFn: () => adminApi.automation.triggerCron(),
    onSuccess: (res) => {
      toast.success(`Processed ${res.processedCount} due publishing jobs!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-overview"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Automation trigger failed";
      toast.error(msg);
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishing.retryJob(id),
    onSuccess: () => {
      toast.success("Retry initiated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Retry failed";
      toast.error(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishing.cancelJob(id),
    onSuccess: () => {
      toast.success("Publishing job cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      adminApi.publishing.rescheduleJob(id, date),
    onSuccess: () => {
      toast.success("Job rescheduled successfully!");
      setRescheduleJobId(null);
      setNewDate("");
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Reschedule failed";
      toast.error(msg);
    },
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Share2 className="h-3.5 w-3.5 text-blue-500" />;
      case "medium":
        return <FileText className="h-3.5 w-3.5 text-emerald-500" />;
      case "website":
        return <Globe className="h-3.5 w-3.5 text-primary" />;
      default:
        return <Globe className="h-3.5 w-3.5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Published
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-[10px]">
            <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="text-[10px]">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px]">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">
            <Clock className="h-2.5 w-2.5 mr-1" /> Scheduled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Publishing Schedule & Automation Queue
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor queued publishing jobs, inspect background retry telemetry, and trigger immediate runs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => triggerCronMutation.mutate()}
            disabled={triggerCronMutation.isPending}
            className="h-8 text-xs gap-1.5 border-border/60 hover:bg-secondary/60"
          >
            {triggerCronMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 text-emerald-500" />
            )}
            Trigger Automation Run Now
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-1 w-fit">
        {["all", "scheduled", "published", "failed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`h-7 px-3 text-xs capitalize rounded-md font-medium transition-all ${
              statusFilter === st
                ? "bg-secondary text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Jobs List / Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No publishing jobs found matching this status filter.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Post Title</th>
                    <th className="px-4 py-3">Scheduled (IST)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Attempts</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {jobs.map((job) => {
                    const postTitle =
                      typeof job.postId === "object" ? job.postId?.title : "Post Draft";
                    const istTime = new Date(job.scheduledAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={job._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(job.platform)}
                            <span className="font-semibold capitalize text-foreground">
                              {job.platform}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 max-w-sm">
                          <p className="font-medium text-foreground truncate">{postTitle}</p>
                          {job.lastError && (
                            <p className="text-[10px] text-destructive truncate">
                              Error: {job.lastError}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-muted-foreground">
                          {istTime}
                        </td>

                        <td className="px-4 py-3.5">{getStatusBadge(job.status)}</td>

                        <td className="px-4 py-3.5 text-center font-mono">
                          {job.attempts}/{job.maxAttempts}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {job.publishedUrl && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                                <a href={job.publishedUrl} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}

                            {job.status === "failed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => retryMutation.mutate(job._id)}
                                title="Retry Now"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {job.status === "scheduled" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => setRescheduleJobId(job._id)}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => cancelMutation.mutate(job._id)}
                                  title="Cancel"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="divide-y divide-border/50 block md:hidden">
              {jobs.map((job) => {
                const postTitle =
                  typeof job.postId === "object" ? job.postId?.title : "Post Draft";
                const istTime = new Date(job.scheduledAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div key={job._id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-xs capitalize">
                        {getPlatformIcon(job.platform)}
                        <span>{job.platform}</span>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>

                    <h4 className="text-xs font-semibold text-foreground line-clamp-1">{postTitle}</h4>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>⏰ {istTime} IST</span>
                      <span>{job.attempts}/{job.maxAttempts} attempts</span>
                    </div>

                    {job.lastError && (
                      <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                        {job.lastError}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40 text-xs">
                      {job.publishedUrl && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <a href={job.publishedUrl} target="_blank" rel="noreferrer">
                            View Live Post
                          </a>
                        </Button>
                      )}
                      {job.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryMutation.mutate(job._id)}
                          className="h-7 text-xs gap-1 border-border/60"
                        >
                          <RotateCw className="h-3 w-3" /> Retry
                        </Button>
                      )}
                      {job.status === "scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRescheduleJobId(job._id)}
                          className="h-7 text-xs border-border/60"
                        >
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleJobId} onOpenChange={(open) => !open && setRescheduleJobId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Reschedule Publishing Job</DialogTitle>
            <DialogDescription className="text-xs">
              Select a new date and time for automated release.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs space-y-2">
            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRescheduleJobId(null)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!newDate || rescheduleMutation.isPending}
              onClick={() =>
                rescheduleMutation.mutate({
                  id: rescheduleJobId!,
                  date: new Date(newDate).toISOString(),
                })
              }
              className="h-8 text-xs"
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

