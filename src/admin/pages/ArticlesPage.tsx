import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { ArticleMedium } from "../types";
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Clock,
  Calendar,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const ArticlesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleMedium | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [articleLink, setArticleLink] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [readTime, setReadTime] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [featured, setFeatured] = useState(false);

  const { data: articles = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => adminApi.articles.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ArticleMedium>) => adminApi.articles.create(data),
    onSuccess: () => {
      toast.success("Medium article added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add article";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ArticleMedium> }) =>
      adminApi.articles.update(id, data),
    onSuccess: () => {
      toast.success("Article updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update article";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.articles.delete(id),
    onSuccess: () => {
      toast.success("Article deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete article";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setArticleLink("");
    setCoverImage("");
    setPublishedAt(new Date().toISOString().split("T")[0]);
    setReadTime("5 min");
    setTagsInput("");
    setIsVisible(true);
    setFeatured(false);
    setEditingArticle(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (article: ArticleMedium) => {
    setEditingArticle(article);
    setTitle(article.title);
    setDescription(article.description);
    setArticleLink(article.articleLink);
    setCoverImage(article.coverImage || "");
    setPublishedAt(article.publishedAt || "");
    setReadTime(article.readTime || "5 min");
    setTagsInput((article.tags || []).join(", "));
    setIsVisible(article.isVisible);
    setFeatured(article.featured);
    setModalOpen(true);
  };

  const handleToggleVisible = (art: ArticleMedium) => {
    updateMutation.mutate({
      id: art._id,
      data: { isVisible: !art.isVisible },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !articleLink.trim()) {
      toast.error("Title and Article Link are required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<ArticleMedium> = {
      title: title.trim(),
      description: description.trim(),
      articleLink: articleLink.trim(),
      coverImage: coverImage.trim() || undefined,
      publishedAt: publishedAt.trim() || undefined,
      readTime: readTime.trim() || undefined,
      tags,
      isVisible,
      featured,
    };

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Medium Articles</h1>
          <p className="text-xs text-muted-foreground">
            Manage your Medium publication links, reading stats, and technical articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs border-border/60"
          >
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="h-8 text-xs gap-1.5 shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Article
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No articles found. Click &quot;Add Article&quot; to link your first publication.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-center">Read Time</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 max-w-md">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="h-9 w-9 rounded-md object-cover border border-border/50 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{item.publishedAt || "N/A"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.readTime || "5 min"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Star
                        className={`h-4 w-4 mx-auto ${
                          item.featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
                        }`}
                      />
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleVisible(item)}
                        title={item.isVisible ? "Visible to public" : "Hidden"}
                      >
                        {item.isVisible ? (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </Button>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                          <a href={item.articleLink} target="_blank" rel="noreferrer" title="Open on Medium">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Article"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteConfirmId(item._id)}
                          title="Delete Article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (block md:hidden) */}
          <div className="divide-y divide-border/50 block md:hidden">
            {filtered.map((item) => (
              <div key={item._id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover border border-border/50 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {item.platform || "Medium"} • {item.readTime || "5 min read"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(item)}
                      className="flex items-center gap-1 text-[11px] font-medium"
                    >
                      {item.isVisible ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <Eye className="h-3.5 w-3.5" /> Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <EyeOff className="h-3.5 w-3.5" /> Hidden
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      className="flex items-center gap-1 text-[11px]"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          item.featured ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                        }`}
                      />
                      {item.featured && <span className="text-amber-500 font-medium">Featured</span>}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.link && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <a href={item.link} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirmId(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingArticle ? "Edit Article" : "Link Medium Article"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide article metadata, publication date, and canonical URL.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">
                  Article Title *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="CLI vs GUI — The Interface War"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="articleLink" className="text-xs font-medium">
                  Medium Article URL *
                </Label>
                <Input
                  id="articleLink"
                  required
                  placeholder="https://medium.com/@mrprince123/..."
                  value={articleLink}
                  onChange={(e) => setArticleLink(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coverImage" className="text-xs font-medium">
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  placeholder="https://miro.medium.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="publishedAt" className="text-xs font-medium">
                    Published Date
                  </Label>
                  <Input
                    id="publishedAt"
                    placeholder="YYYY-MM-DD"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="readTime" className="text-xs font-medium">
                    Read Time
                  </Label>
                  <Input
                    id="readTime"
                    placeholder="e.g. 6 min"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs font-medium">
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="System Design, Operating Systems, CLI"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium">
                  Summary / Snippet
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Article summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                  <Label htmlFor="isVisible" className="text-xs font-medium cursor-pointer">
                    Visible
                  </Label>
                  <Switch id="isVisible" checked={isVisible} onCheckedChange={setIsVisible} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                  <Label htmlFor="featured" className="text-xs font-medium cursor-pointer">
                    Featured
                  </Label>
                  <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="text-xs h-8 gap-1.5"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Article"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this Medium article listing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              className="text-xs h-8"
              onClick={() => {
                if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

