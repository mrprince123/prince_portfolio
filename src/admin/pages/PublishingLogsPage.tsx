import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { PublishingLog } from "../types";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Search,
  Share2,
  Globe,
  FileText,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const PublishingLogsPage: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<PublishingLog | null>(null);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "publishing-logs", platformFilter],
    queryFn: () => adminApi.publishing.getLogs(platformFilter, 100),
    refetchInterval: 30000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Success
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="text-[10px]">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Error
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[10px]">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            <Info className="h-2.5 w-2.5 mr-1" /> Info
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
            <Clock className="h-5 w-5 text-primary" />
            Publishing Audit & Telemetry Logs
          </h1>
          <p className="text-xs text-muted-foreground">
            Immutable log trail of all automated background executions, Telegram bot updates, and platform API calls
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-8 text-xs gap-1 border-border/60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-1 w-fit">
        {["all", "linkedin", "medium", "website", "cron"].map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`h-7 px-3 text-xs capitalize rounded-md font-medium transition-all ${
              platformFilter === p
                ? "bg-secondary text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No audit logs found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.map((log) => {
                  const ist = new Date(log.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "short",
                    timeStyle: "medium",
                  });

                  return (
                    <tr
                      key={log._id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                        {ist}
                      </td>

                      <td className="px-4 py-3 font-semibold uppercase text-[11px]">
                        {log.platform}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {log.action}
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(log.status)}</td>

                      <td className="px-4 py-3 max-w-md">
                        <p className="text-foreground truncate">{log.message}</p>
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Audit Log Record Details
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Action: {selectedLog?.action} • Platform: {selectedLog?.platform}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg bg-muted/30 p-3 border border-border/50 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Log Message</p>
                <p className="font-semibold text-foreground">{selectedLog.message}</p>
              </div>

              {selectedLog.details && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Payload Details</p>
                  <pre className="p-3 rounded-lg bg-muted/40 font-mono text-[11px] overflow-x-auto border border-border/50 text-foreground/90">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

