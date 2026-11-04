import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Post, ContentTemplate } from "../types";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Calendar,
  Share2,
  FileText,
  Globe,
  SlidersHorizontal,
  RefreshCw,
  Edit3,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const PublishingStudioPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Studio Mode: "editor" | "brainstorm"
  const [activeTab, setActiveTab] = useState<"editor" | "brainstorm">("editor");

  // Idea / Post Input State
  const [topicInput, setTopicInput] = useState("");
  const [detailsInput, setDetailsInput] = useState("");

  // Brainstorm Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "model",
      content:
        "👋 Hi Prince! Share a technical thought, architecture challenge, or article concept you want to explore. I'll help you uncover sharp angles and refine the hook.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBrainstorming, setIsBrainstorming] = useState(false);

  // Active Draft in Studio
  const [activePost, setActivePost] = useState<Partial<Post> | null>(null);
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<"linkedin" | "medium" | "website">(
    "linkedin"
  );

  // Refine Prompt Input
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Scheduling Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "website"]);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateData, setTemplateData] = useState<Partial<ContentTemplate>>({});

  // Query Templates
  const { data: template } = useQuery({
    queryKey: ["admin", "ai-template"],
    queryFn: () => adminApi.ai.getTemplate(),
  });

  // Query Recent Posts
  const { data: recentPosts = [] } = useQuery({
    queryKey: ["admin", "publishing-posts"],
    queryFn: () => adminApi.publishing.getPosts(),
  });

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: (data: { title: string; details?: string }) => adminApi.ai.generate(data),
    onSuccess: (generated) => {
      setActivePost({
        ...generated,
        overallStatus: "draft",
      });
      setActiveTab("editor");
      toast.success("Multi-platform drafts generated successfully via Gemini Flash!");
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-posts"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to generate content";
      toast.error(msg);
    },
  });

  // Save Draft Mutation
  const savePostMutation = useMutation({
    mutationFn: (postData: Partial<Post>) => {
      if (postData._id) {
        return adminApi.publishing.updatePost(postData._id, postData);
      }
      return adminApi.publishing.createPost(postData);
    },
    onSuccess: (saved) => {
      setActivePost(saved);
      toast.success("Draft saved to MongoDB!");
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-overview"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      toast.error(msg);
    },
  });

  // Stage 1 Approval Mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, platform }: { id: string; platform: string }) =>
      adminApi.publishing.approveVariant(id, platform, true),
    onSuccess: (updated) => {
      setActivePost(updated);
      toast.success(`Stage 1 Approved: ${selectedPlatformTab.toUpperCase()} variant ready to publish!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-posts"] });
    },
  });

  // Stage 2 Scheduling Mutation
  const scheduleMutation = useMutation({
    mutationFn: ({
      id,
      platforms,
      scheduledAt,
    }: {
      id: string;
      platforms: string[];
      scheduledAt: string;
    }) => adminApi.publishing.schedulePost(id, platforms, scheduledAt),
    onSuccess: () => {
      toast.success("Stage 2 Complete: Publishing jobs queued for GitHub Actions automation!");
      setScheduleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Scheduling failed";
      toast.error(msg);
    },
  });

  // Immediate Publish Mutation
  const publishNowMutation = useMutation({
    mutationFn: ({ id, platforms }: { id: string; platforms?: string[] }) =>
      adminApi.publishing.publishNow(id, platforms),
    onSuccess: () => {
      toast.success("Published immediately across selected platforms!");
      setScheduleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-jobs"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Publishing failed";
      toast.error(msg);
    },
  });

  // Handle Brainstorm Chat Submit
  const handleBrainstormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBrainstorming) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsBrainstorming(true);

    try {
      const res = await adminApi.ai.brainstorm({
        topic: userMsg,
        messages: chatMessages,
      });

      setChatMessages((prev) => [...prev, { role: "model", content: res.reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to brainstorm";
      toast.error(msg);
    } finally {
      setIsBrainstorming(false);
    }
  };

  // Handle Refine Single Platform Content
  const handleRefine = async () => {
    if (!refinePrompt.trim() || !activePost) return;

    let targetContent = "";
    if (selectedPlatformTab === "linkedin") targetContent = activePost.linkedin?.content || "";
    if (selectedPlatformTab === "medium") targetContent = activePost.medium?.markdownContent || "";
    if (selectedPlatformTab === "website") targetContent = activePost.website?.content || "";

    setIsRefining(true);
    try {
      const res = await adminApi.ai.refine({
        content: targetContent,
        instruction: refinePrompt.trim(),
        platform: selectedPlatformTab,
      });

      const updated = { ...activePost };
      if (selectedPlatformTab === "linkedin") {
        updated.linkedin = { ...updated.linkedin!, content: res.refinedContent, isApproved: false };
      } else if (selectedPlatformTab === "medium") {
        updated.medium = { ...updated.medium!, markdownContent: res.refinedContent, isApproved: false };
      } else if (selectedPlatformTab === "website") {
        updated.website = { ...updated.website!, content: res.refinedContent, isApproved: false };
      }

      setActivePost(updated);
      setRefinePrompt("");
      toast.success(`Refined ${selectedPlatformTab.toUpperCase()} draft successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refinement failed";
      toast.error(msg);
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content & Publishing Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            Brainstorm with Gemini, tailor multi-platform content, and automate publishing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (template) setTemplateData(template);
              setTemplateModalOpen(true);
            }}
            className="h-8 text-xs gap-1.5 border-border/60"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            AI Persona
          </Button>

          <div className="flex rounded-lg border border-border/60 bg-muted/20 p-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-secondary text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Studio Editor
            </button>
            <button
              onClick={() => setActiveTab("brainstorm")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "brainstorm"
                  ? "bg-secondary text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Brainstorming
            </button>
          </div>
        </div>
      </div>

      {/* Generator Prompt Bar */}
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="topicInput" className="text-xs font-medium">
              Article or Post Topic
            </Label>
            <Input
              id="topicInput"
              placeholder="e.g. Architectural trade-offs of microservices vs modular monoliths in 2026"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detailsInput" className="text-xs font-medium">
              Specific Angles or Key Points (Optional)
            </Label>
            <Input
              id="detailsInput"
              placeholder="e.g. Focus on operational overhead and developer velocity"
              value={detailsInput}
              onChange={(e) => setDetailsInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground font-mono">
            Model: {template?.tone ? "Customized Persona" : "Google Gemini 1.5 Flash (Free)"}
          </span>
          <Button
            size="sm"
            onClick={() =>
              generateMutation.mutate({
                title: topicInput,
                details: detailsInput,
              })
            }
            disabled={!topicInput.trim() || generateMutation.isPending}
            className="h-8 text-xs gap-1.5"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating Multi-Platform Drafts...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Multi-Platform Drafts
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Studio View */}
      {activeTab === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Content Editor & Variant Selector */}
          <div className="lg:col-span-2 space-y-4">
            {activePost ? (
              <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
                {/* Platform Tabs Header */}
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatformTab("linkedin")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPlatformTab === "linkedin"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      LinkedIn
                      {activePost.linkedin?.isApproved && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlatformTab("medium")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPlatformTab === "medium"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Medium
                      {activePost.medium?.isApproved && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlatformTab("website")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPlatformTab === "website"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website Blog
                      {activePost.website?.isApproved && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => savePostMutation.mutate(activePost)}
                      disabled={savePostMutation.isPending}
                      className="h-7 text-xs border-border/60"
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>

                {/* Platform Specific Content Area */}
                <div className="p-5 space-y-4">
                  {selectedPlatformTab === "linkedin" && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">LinkedIn Post Content</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {activePost.linkedin?.content?.length || 0} characters
                        </span>
                      </div>
                      <Textarea
                        rows={12}
                        value={activePost.linkedin?.content || ""}
                        onChange={(e) =>
                          setActivePost({
                            ...activePost,
                            linkedin: {
                              ...activePost.linkedin!,
                              content: e.target.value,
                              isApproved: false,
                            },
                          })
                        }
                        className="text-xs font-sans leading-relaxed"
                      />

                      {activePost.linkedin?.hashtags && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activePost.linkedin.hashtags.map((h, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-mono">
                              {h.startsWith("#") ? h : `#${h}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPlatformTab === "medium" && (
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Medium Article Title</Label>
                        <Input
                          value={activePost.medium?.title || activePost.title || ""}
                          onChange={(e) =>
                            setActivePost({
                              ...activePost,
                              medium: {
                                ...activePost.medium!,
                                title: e.target.value,
                              },
                            })
                          }
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Subtitle</Label>
                        <Input
                          value={activePost.medium?.subtitle || ""}
                          onChange={(e) =>
                            setActivePost({
                              ...activePost,
                              medium: {
                                ...activePost.medium!,
                                subtitle: e.target.value,
                              },
                            })
                          }
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Markdown Article Body</Label>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {activePost.medium?.markdownContent?.length || 0} chars
                          </span>
                        </div>
                        <Textarea
                          rows={14}
                          value={activePost.medium?.markdownContent || ""}
                          onChange={(e) =>
                            setActivePost({
                              ...activePost,
                              medium: {
                                ...activePost.medium!,
                                markdownContent: e.target.value,
                                isApproved: false,
                              },
                            })
                          }
                          className="text-xs font-mono leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPlatformTab === "website" && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Blog Post Title</Label>
                          <Input
                            value={activePost.website?.title || activePost.title || ""}
                            onChange={(e) =>
                              setActivePost({
                                ...activePost,
                                website: {
                                  ...activePost.website!,
                                  title: e.target.value,
                                },
                              })
                            }
                            className="h-8 text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">URL Slug</Label>
                          <Input
                            value={activePost.website?.slug || ""}
                            onChange={(e) =>
                              setActivePost({
                                ...activePost,
                                website: {
                                  ...activePost.website!,
                                  slug: e.target.value,
                                },
                              })
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Summary (SEO & Card Preview)</Label>
                        <Textarea
                          rows={2}
                          value={activePost.website?.summary || ""}
                          onChange={(e) =>
                            setActivePost({
                              ...activePost,
                              website: {
                                ...activePost.website!,
                                summary: e.target.value,
                              },
                            })
                          }
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Full Content (Markdown)</Label>
                        <Textarea
                          rows={12}
                          value={activePost.website?.content || activePost.medium?.markdownContent || ""}
                          onChange={(e) =>
                            setActivePost({
                              ...activePost,
                              website: {
                                ...activePost.website!,
                                content: e.target.value,
                                isApproved: false,
                              },
                            })
                          }
                          className="text-xs font-mono leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Iterative AI Refinement Bar */}
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                    <Label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                      <Edit3 className="h-3 w-3 text-primary" />
                      Refine {selectedPlatformTab.toUpperCase()} with Gemini
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Make the hook more contrarian, add code snippet, shorten by 20%..."
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        className="h-8 text-xs"
                        onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                      />
                      <Button
                        size="sm"
                        onClick={handleRefine}
                        disabled={!refinePrompt.trim() || isRefining}
                        className="h-8 text-xs shrink-0"
                      >
                        {isRefining ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refine"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2-Stage Approval Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/60 p-4 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium">
                      Stage 1 Approval:{" "}
                      {activePost[selectedPlatformTab]?.isApproved ? (
                        <span className="text-emerald-500 font-bold">Approved</span>
                      ) : (
                        <span className="text-amber-500 font-bold">Pending Review</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activePost._id ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            approveMutation.mutate({
                              id: activePost._id!,
                              platform: selectedPlatformTab,
                            })
                          }
                          disabled={approveMutation.isPending}
                          className="h-8 text-xs gap-1 border-border/60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve {selectedPlatformTab.toUpperCase()}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setScheduleModalOpen(true)}
                          className="h-8 text-xs gap-1.5 shadow-xs"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Stage 2: Schedule & Publish
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => savePostMutation.mutate(activePost)}
                        disabled={savePostMutation.isPending}
                        className="h-8 text-xs gap-1"
                      >
                        Save Draft First to Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-12 text-center space-y-3 bg-card/30">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="font-semibold text-sm">No Post Loaded in Studio</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Type an idea in the generator bar above, or select an existing draft from the list to
                  preview and schedule.
                </p>
              </div>
            )}
          </div>

          {/* Right: Saved Drafts Queue */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider">Saved Drafts Queue</h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {recentPosts.length}
                </Badge>
              </div>

              <div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
                {recentPosts.length === 0 ? (
                  <p className="p-4 text-center text-xs text-muted-foreground">
                    No drafts saved yet.
                  </p>
                ) : (
                  recentPosts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => setActivePost(post)}
                      className={`p-3 space-y-1.5 cursor-pointer rounded-lg hover:bg-muted/40 transition-colors ${
                        activePost?._id === post._id ? "bg-muted/50 border border-primary/30" : ""
                      }`}
                    >
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span className="capitalize">{post.overallStatus}</span>
                        <div className="flex items-center gap-1">
                          <span>LI:{post.linkedin?.isApproved ? "✅" : "⏳"}</span>
                          <span>Med:{post.medium?.isApproved ? "✅" : "⏳"}</span>
                          <span>Web:{post.website?.isApproved ? "✅" : "⏳"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Conversational Brainstorming Mode */
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                Conversational Brainstorming Dialogue
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Synchronized with Telegram Assistant
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 space-y-1 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/40 border border-border/50 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isBrainstorming && (
              <div className="flex justify-start">
                <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Gemini is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleBrainstormSubmit}
            className="p-3 border-t border-border/60 bg-muted/20 flex gap-2"
          >
            <Input
              placeholder="Ask a question, propose a technical challenge, or explore an angle..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="h-9 text-xs"
            />
            <Button type="submit" size="sm" disabled={!chatInput.trim() || isBrainstorming} className="h-9">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Stage 2 Scheduling Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Stage 2: Publishing & Schedule Approval
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm which platforms will receive this content and set the release time in IST.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Select Target Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {["linkedin", "website", "medium"].map((p) => {
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, p]);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs capitalize font-medium transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border/60 text-muted-foreground"
                      }`}
                    >
                      <span>{p}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="schedTime" className="text-xs font-medium">
                Scheduled Publication Time (IST)
              </Label>
              <Input
                id="schedTime"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Leave empty or click &quot;Publish Immediately&quot; for instant live release.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => publishNowMutation.mutate({ id: activePost?._id!, platforms: selectedPlatforms })}
              disabled={publishNowMutation.isPending}
              className="text-xs h-8"
            >
              {publishNowMutation.isPending ? "Publishing..." : "⚡ Publish Immediately"}
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!scheduleDate || scheduleMutation.isPending}
              onClick={() =>
                scheduleMutation.mutate({
                  id: activePost?._id!,
                  platforms: selectedPlatforms,
                  scheduledAt: new Date(scheduleDate).toISOString(),
                })
              }
              className="text-xs h-8"
            >
              {scheduleMutation.isPending ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

