import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Project } from "../types";
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Github,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"web" | "android" | "cloud" | "script">("web");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [techInput, setTechInput] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [featured, setFeatured] = useState(false);

  const { data: projects = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: () => adminApi.projects.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => adminApi.projects.create(data),
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create project";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      adminApi.projects.update(id, data),
    onSuccess: () => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update project";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.projects.delete(id),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("web");
    setLiveUrl("");
    setGithubUrl("");
    setCoverImage("");
    setTechInput("");
    setIsVisible(true);
    setFeatured(false);
    setEditingProject(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || "");
    setCategory(project.category);
    setLiveUrl(project.liveUrl || "");
    setGithubUrl(project.githubUrl || "");
    setCoverImage(project.coverImage || "");
    setTechInput((project.technologies || []).join(", "));
    setIsVisible(project.isVisible);
    setFeatured(project.featured);
    setModalOpen(true);
  };

  const handleToggleVisible = (project: Project) => {
    updateMutation.mutate({
      id: project._id,
      data: { isVisible: !project.isVisible },
    });
  };

  const handleToggleFeatured = (project: Project) => {
    updateMutation.mutate({
      id: project._id,
      data: { featured: !project.featured },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }

    const technologies = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (technologies.length === 0) {
      toast.error("Please add at least one technology stack tag");
      return;
    }

    const payload: Partial<Project> = {
      title: title.trim(),
      description: description.trim(),
      category,
      liveUrl: liveUrl.trim(),
      githubUrl: githubUrl.trim(),
      coverImage: coverImage.trim() || undefined,
      technologies,
      isVisible,
      featured,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Portfolio Projects</h1>
          <p className="text-xs text-muted-foreground">
            Manage your showcased works, applications, live demos, and repos
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
            Add Project
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="android">Android</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="script">Script</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search projects or tech..."
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
            No projects found matching the criteria. Click &quot;Add Project&quot; to create one.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Technologies</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-center gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="h-9 w-9 rounded-md object-cover border border-border/50 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            /{item.slug || "no-slug"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {item.category}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(item.technologies || []).slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                        {(item.technologies || []).length > 3 && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            +{(item.technologies || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleFeatured(item)}
                        title={item.featured ? "Featured Project" : "Not Featured"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            item.featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"
                          }`}
                        />
                      </Button>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleVisible(item)}
                        title={item.isVisible ? "Visible to public" : "Hidden / Draft"}
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
                        {item.liveUrl && item.liveUrl !== "N/A" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                            <a href={item.liveUrl} target="_blank" rel="noreferrer" title="Open Live Site">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        {item.githubUrl && item.githubUrl !== "N/A" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                            <a href={item.githubUrl} target="_blank" rel="noreferrer" title="Open GitHub Repo">
                              <Github className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Project"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteConfirmId(item._id)}
                          title="Delete Project"
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
                      <FolderGit2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>

                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 4).map((tech, i) => (
                      <span key={i} className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                    {item.technologies.length > 4 && (
                      <span className="text-[10px] font-mono text-muted-foreground self-center">
                        +{item.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}

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
                    {item.liveUrl && item.liveUrl !== "N/A" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <a href={item.liveUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {item.githubUrl && item.githubUrl !== "N/A" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <a href={item.githubUrl} target="_blank" rel="noreferrer">
                          <Github className="h-4 w-4" />
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
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fill out the project details, external links, and tech stack.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Cook Book: Recipe Master"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-medium">
                    Category *
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val: "web" | "android" | "cloud" | "script") => setCategory(val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Application</SelectItem>
                      <SelectItem value="android">Android App</SelectItem>
                      <SelectItem value="cloud">Cloud / DevOps</SelectItem>
                      <SelectItem value="script">Script / Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="technologies" className="text-xs font-medium">
                    Technologies (comma separated) *
                  </Label>
                  <Input
                    id="technologies"
                    required
                    placeholder="React, TypeScript, Node.js, MongoDB"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="liveUrl" className="text-xs font-medium">
                    Live Demo / App Store URL
                  </Label>
                  <Input
                    id="liveUrl"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="githubUrl" className="text-xs font-medium">
                    GitHub Repository URL
                  </Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
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
                <Label htmlFor="description" className="text-xs font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Comprehensive description of the application architecture, key features, and problem it solves..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="isVisible" className="text-xs font-medium cursor-pointer">
                    Visible on Public Portfolio
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Disable to keep in draft mode or unlist from the portfolio.
                  </p>
                </div>
                <Switch id="isVisible" checked={isVisible} onCheckedChange={setIsVisible} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="featured" className="text-xs font-medium cursor-pointer">
                    Featured Project
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Highlighted on the home page and top of project listings.
                  </p>
                </div>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
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
                  "Save Project"
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
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this project? This action cannot be reversed.
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

