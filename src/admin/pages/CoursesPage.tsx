import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Course, CourseTopic } from "../types";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  AlertTriangle,
  X,
  Layers,
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

export const CoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [tagsInput, setTagsInput] = useState("");
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Topic Sub-form State
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicContent, setTopicContent] = useState("");

  const { data: courses = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => adminApi.courses.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Course>) => adminApi.courses.create(data),
    onSuccess: () => {
      toast.success("Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create course";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      adminApi.courses.update(id, data),
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update course";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.courses.delete(id),
    onSuccess: () => {
      toast.success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete course";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCoverImage("");
    setLevel("Beginner");
    setTagsInput("");
    setTopics([]);
    setTopicTitle("");
    setTopicDescription("");
    setTopicContent("");
    setIsVisible(true);
    setFeatured(false);
    setEditingCourse(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description || "");
    setCoverImage(course.coverImage || "");
    setLevel(course.level || "Beginner");
    setTagsInput((course.tags || []).join(", "));
    setTopics(course.content || []);
    setIsVisible(course.isVisible);
    setFeatured(course.featured);
    setModalOpen(true);
  };

  const handleAddTopic = () => {
    if (!topicTitle.trim()) {
      toast.error("Topic title is required");
      return;
    }
    setTopics([
      ...topics,
      {
        title: topicTitle.trim(),
        description: topicDescription.trim(),
        content: topicContent.trim(),
      },
    ]);
    setTopicTitle("");
    setTopicDescription("");
    setTopicContent("");
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleToggleVisible = (course: Course) => {
    updateMutation.mutate({
      id: course._id,
      data: { isVisible: !course.isVisible },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Course title is required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<Course> = {
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || undefined,
      level,
      tags,
      content: topics,
      isVisible,
      featured,
    };

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Courses & Curricula</h1>
          <p className="text-xs text-muted-foreground">
            Manage comprehensive learning tracks, syllabus modules, and exercises
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
            Create Course
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
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
            No courses found. Click &quot;Create Course&quot; to build your first curriculum.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3 text-center">Modules</th>
                  <th className="px-4 py-3 text-center">Featured</th>
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
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.level}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="rounded bg-secondary/80 px-2 py-0.5 text-[10px] text-foreground font-semibold">
                        {(item.content || []).length} topics
                      </span>
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
                        title={item.isVisible ? "Visible to public" : "Hidden (Draft)"}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Course"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteConfirmId(item._id)}
                          title="Delete Course"
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
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0">
                        {item.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
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

                    <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {(item.topics || []).length} modules
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
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
                {editingCourse ? "Edit Course Curriculum" : "Create New Course"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure syllabus topics, difficulty level, and tags.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">
                  Course Title *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Mastering Software Engineering for Scalable Applications"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="level" className="text-xs font-medium">
                    Difficulty Level *
                  </Label>
                  <Select
                    value={level}
                    onValueChange={(val: "Beginner" | "Intermediate" | "Advanced") => setLevel(val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags" className="text-xs font-medium">
                    Tags (comma separated)
                  </Label>
                  <Input
                    id="tags"
                    placeholder="Backend, Architecture, Node.js"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coverImage" className="text-xs font-medium">
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium">
                  Overview Description
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Detailed course overview and learning objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Curriculum Modules ({topics.length})
                  </span>
                </div>

                {topics.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {topics.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-card p-2 border border-border/50 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono text-muted-foreground mr-1.5">{idx + 1}.</span>
                          <span className="font-medium text-foreground">{t.title}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveTopic(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-muted-foreground font-medium">Add Module Topic:</p>
                  <Input
                    placeholder="Topic Title (e.g. 1. System Design Fundamentals)"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="h-7 text-xs bg-card"
                  />
                  <Textarea
                    rows={2}
                    placeholder="Topic summary / content overview..."
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="text-xs bg-card"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddTopic}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Module
                  </Button>
                </div>
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
                  "Save Course"
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
              Delete Course
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this course and its syllabus? This cannot be undone.
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

