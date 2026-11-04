import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Idea } from "../types";
import {
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit2,
  Mic,
  MessageSquare,
  Tag,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const IdeasLibraryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { data: ideas = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "ideas", statusFilter, search],
    queryFn: () => adminApi.publishing.getIdeas(statusFilter, search),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Idea>) => {
      if (editingIdea) {
        return adminApi.publishing.updateIdea(editingIdea._id, data);
      }
      return adminApi.publishing.createIdea(data);
    },
    onSuccess: () => {
      toast.success(editingIdea ? "Idea updated!" : "New idea captured!");
      setModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-overview"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save idea";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishing.deleteIdea(id),
    onSuccess: () => {
      toast.success("Idea removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "ideas"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "publishing-overview"] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setTargetAudience("");
    setTagsInput("");
    setEditingIdea(null);
  };

  const handleOpenEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setSummary(idea.summary || "");
    setTargetAudience(idea.targetAudience || "");
    setTagsInput((idea.tags || []).join(", "));
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    saveMutation.mutate({
      title: title.trim(),
      summary: summary.trim(),
      targetAudience: targetAudience.trim(),
      tags,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Ideas Library & Brainstorming Vault
          </h1>
          <p className="text-xs text-muted-foreground">
            Synchronized repository of thoughts captured via Telegram voice notes, text messages, and studio notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="h-8 text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Capture Idea
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-1">
          {["all", "raw", "brainstormed", "drafted", "published"].map((st) => (
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

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search ideas, angles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Grid of Idea Cards */}
      {ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 p-12 text-center space-y-3 bg-card/30">
          <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-sm">No Ideas Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Send a voice note to your Telegram bot or click &quot;Capture Idea&quot; to begin building your repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-border transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <Badge variant="outline" className="text-[9px] font-mono capitalize shrink-0">
                    {item.status}
                  </Badge>
                </div>

                {item.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  {item.source === "telegram_voice" ? (
                    <span className="flex items-center gap-1 text-purple-500">
                      <Mic className="h-3 w-3" /> Voice Note
                    </span>
                  ) : item.source === "telegram_text" ? (
                    <span className="flex items-center gap-1 text-blue-500">
                      <MessageSquare className="h-3 w-3" /> Telegram Chat
                    </span>
                  ) : (
                    <span>Manual</span>
                  )}
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(item._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/admin/publishing/studio")}
                  className="h-7 text-[11px] gap-1 border-border/60 hover:bg-secondary/60"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  Draft Posts
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Capture / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingIdea ? "Edit Idea" : "Capture Technical Idea"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record topics, architecture questions, or takeaways to develop later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="iTitle" className="text-xs font-medium">Idea Title *</Label>
                <Input
                  id="iTitle"
                  required
                  placeholder="e.g. Zero-cost serverless background automation with GitHub Actions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iSummary" className="text-xs font-medium">Notes & Angles</Label>
                <Textarea
                  id="iSummary"
                  rows={4}
                  placeholder="Summarize the core realization, counter-intuitive lesson, or technical details..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iTags" className="text-xs font-medium">Tags (comma separated)</Label>
                <Input
                  id="iTags"
                  placeholder="DevOps, Serverless, Node.js"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saveMutation.isPending || !title.trim()} className="h-8 text-xs">
                {saveMutation.isPending ? "Saving..." : "Save Idea"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

