import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { BlogPost, BlogTag } from "../types";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  Clock,
  Loader2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export const BlogsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Prince Sahni");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [featured, setFeatured] = useState(false);

  const { data: blogs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "blogs"],
    queryFn: () => adminApi.blogs.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<BlogPost>) => adminApi.blogs.create(data),
    onSuccess: () => {
      toast.success("Blog post created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create blog";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPost> }) =>
      adminApi.blogs.update(id, data),
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update blog";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.blogs.delete(id),
    onSuccess: () => {
      toast.success("Blog post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete blog";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setTitle("");
    setAuthor("Prince Sahni");
    setDescription("");
    setCoverImage("");
    setContent("");
    setTags([]);
    setNewTagName("");
    setIsVisible(true);
    setFeatured(false);
    setEditingBlog(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setAuthor(blog.author || "Prince Sahni");
    setDescription(blog.description);
    setCoverImage(blog.coverImage || "");
    setContent(blog.content);
    setTags(blog.tags || []);
    setIsVisible(blog.isVisible);
    setFeatured(blog.featured);
    setModalOpen(true);
  };

  const handleToggleVisible = (blog: BlogPost) => {
    updateMutation.mutate({
      id: blog._id,
      data: { isVisible: !blog.isVisible },
    });
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    setTags([...tags, { name: newTagName.trim() }]);
    setNewTagName("");
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error("Please fill in Title, Description, and Content");
      return;
    }

    const payload: Partial<BlogPost> = {
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || undefined,
      content,
      tags,
      isVisible,
      featured,
    };

    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-xs text-muted-foreground">
            Publish technical writeups, tutorials, and portfolio engineering blogs
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
            Write Post
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No blog posts found. Click &quot;Write Post&quot; to publish your first article.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3 text-center">Likes</th>
                  <th className="px-4 py-3 text-center">Read Time</th>
                  <th className="px-4 py-3 text-center">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="h-9 w-9 rounded-md object-cover border border-border/50 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            /blog/{item.slug || "draft"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium">{item.author}</td>

                    <td className="px-4 py-3.5 text-center font-mono">
                      <div className="flex items-center justify-center gap-1 text-rose-500">
                        <Heart className="h-3 w-3 fill-rose-500" />
                        <span>{item.likes ?? 0}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.readTime ?? 3}m</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleVisible(item)}
                        title={item.isVisible ? "Published (Visible)" : "Hidden (Draft)"}
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
                        {item.slug && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                            <a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer" title="Preview Live Post">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Post"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteConfirmId(item._id)}
                          title="Delete Post"
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
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                      By {item.author || "Admin"} • {item.readTime ?? 3} min read
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(item)}
                      className="flex items-center gap-1 text-[11px] font-medium"
                    >
                      {item.isVisible ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <Eye className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <EyeOff className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-rose-500 font-mono text-[11px]">
                      <Heart className="h-3.5 w-3.5 fill-rose-500" />
                      <span>{item.likes ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.slug && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer">
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingBlog ? "Edit Blog Post" : "Write New Blog Post"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Author and format blog content using Markdown or HTML.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. What is API?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-xs font-medium">
                    Author *
                  </Label>
                  <Input
                    id="author"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium">
                  Summary / Excerpt *
                </Label>
                <Textarea
                  id="description"
                  rows={2}
                  required
                  placeholder="Short engaging summary shown on blog preview cards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coverImage" className="text-xs font-medium">
                  Cover Image URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coverImage"
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Preview"
                      className="h-8 w-8 rounded object-cover border border-border/50 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (e.g. Architecture, API, Node.js)"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="h-8 text-xs">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 pr-1 text-[10px]">
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-medium">
                  Article Content (HTML or Markdown) *
                </Label>
                <Textarea
                  id="content"
                  rows={10}
                  required
                  placeholder="Write the full post here. Supports HTML tags (<h1>, <p>, <code>, <img>) or Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="isVisible" className="text-xs font-medium cursor-pointer">
                      Published
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Visible on portfolio</p>
                  </div>
                  <Switch id="isVisible" checked={isVisible} onCheckedChange={setIsVisible} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured" className="text-xs font-medium cursor-pointer">
                      Featured
                    </Label>
                    <p className="text-[10px] text-muted-foreground">Pinned to top</p>
                  </div>
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
                  "Save Post"
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
              Delete Blog Post
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this blog post? This action cannot be reversed.
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

