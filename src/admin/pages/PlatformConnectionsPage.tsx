import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Globe,
  FileText,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const PlatformConnectionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [webhookUrlInput, setWebhookUrlInput] = useState("");

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["admin", "platform-status"],
    queryFn: () => adminApi.platforms.getStatus(),
  });

  const connectLinkedInMutation = useMutation({
    mutationFn: () => adminApi.platforms.getLinkedInAuthUrl(),
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to initiate LinkedIn OAuth";
      toast.error(msg);
    },
  });

  const disconnectLinkedInMutation = useMutation({
    mutationFn: () => adminApi.platforms.disconnectLinkedIn(),
    onSuccess: () => {
      toast.success("LinkedIn disconnected");
      queryClient.invalidateQueries({ queryKey: ["admin", "platform-status"] });
    },
  });

  const setWebhookMutation = useMutation({
    mutationFn: (url: string) => adminApi.telegram.setWebhook(url),
    onSuccess: () => {
      toast.success("Telegram webhook registered successfully!");
      setWebhookUrlInput("");
      queryClient.invalidateQueries({ queryKey: ["admin", "platform-status"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to set webhook";
      toast.error(msg);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Platform Connections & Integrations
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage official publishing platform credentials, Telegram bot webhooks, and AI engine telemetry
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="h-8 text-xs gap-1 border-border/60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Official Integration */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">LinkedIn Official API</h2>
            </div>
            {status?.linkedin?.isConnected ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                Not Connected
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Posts live technical updates and articles directly to your LinkedIn feed using the official LinkedIn Community Management API.
            </p>

            <div className="rounded-lg bg-muted/20 p-3 space-y-2 border border-border/40 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Account:</span>
                <span className="text-foreground">{status?.linkedin?.accountName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Status:</span>
                <span>
                  {status?.linkedin?.expiresAt
                    ? `Expires ${new Date(status.linkedin.expiresAt).toLocaleDateString()}`
                    : "Awaiting OAuth"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Scope:</span>
                <span className="text-emerald-500">openid profile w_member_social</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {status?.linkedin?.isConnected ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => disconnectLinkedInMutation.mutate()}
                  disabled={disconnectLinkedInMutation.isPending}
                  className="h-8 text-xs gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Disconnect LinkedIn
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => connectLinkedInMutation.mutate()}
                  disabled={connectLinkedInMutation.isPending}
                  className="h-8 text-xs gap-1.5 shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Connect LinkedIn via OAuth
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Medium Publishing Workflow */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Medium Publishing Workflow</h2>
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Medium has officially deprecated new API integration tokens. Our platform provides a seamless, 100% free workflow:
            </p>

            <div className="rounded-lg bg-muted/20 p-3 space-y-2 border border-border/40 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Generates publication-ready Markdown and semantic HTML with code syntax.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Sets your portfolio blog as the canonical URL to preserve SEO authority.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Provides a 1-click official Medium Story Import URL.</span>
              </div>
            </div>

            <div className="pt-1">
              <Button size="sm" variant="outline" asChild className="h-8 text-xs gap-1 border-border/60">
                <a href="https://medium.com/p/import" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Medium Import Tool
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Telegram Bot Personal Assistant */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Telegram Personal Assistant</h2>
            </div>
            {status?.telegram?.isConfigured ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]">
                Bot Token Missing
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Provides voice-based and text-based brainstorming, draft generation, and 2-stage publishing approvals on Telegram.
            </p>

            <div className="rounded-lg bg-muted/20 p-3 space-y-1.5 border border-border/40 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authorized Owner ID:</span>
                <span className="text-foreground">{status?.telegram?.authorizedUserId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Webhook URL:</span>
                <span className="truncate max-w-[200px]">
                  {status?.telegram?.webhook?.url || "Not Registered"}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Label className="text-xs font-medium">Update Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://your-backend.vercel.app/api/v1/telegram/webhook"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Button
                  size="sm"
                  onClick={() => setWebhookMutation.mutate(webhookUrlInput.trim())}
                  disabled={!webhookUrlInput.trim() || setWebhookMutation.isPending}
                  className="h-8 text-xs shrink-0"
                >
                  {setWebhookMutation.isPending ? "Setting..." : "Register Webhook"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Google Gemini AI Free Engine */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Google Gemini AI Engine</h2>
            </div>
            {status?.ai?.isConfigured ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> 100% Free Tier
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]">
                API Key Missing
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Powers all technical drafting, brainstorming, tone adaptation, and native voice note transcriptions at zero cost.
            </p>

            <div className="rounded-lg bg-muted/20 p-3 space-y-2 border border-border/40 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Model:</span>
                <span className="text-primary font-bold">{status?.ai?.model || "gemini-1.5-flash"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free Rate Quota:</span>
                <span>15 Requests / min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Free Allowance:</span>
                <span>1,500 Requests / day</span>
              </div>
            </div>

            <div className="pt-1">
              <Button size="sm" variant="outline" asChild className="h-8 text-xs gap-1 border-border/60">
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google AI Studio Console
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

