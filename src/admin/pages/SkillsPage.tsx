import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { SkillCategory, SkillItem } from "../types";
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  X,
  Sparkles,
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

export const SkillsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Sub-item State
  const [skillName, setSkillName] = useState("");
  const [skillIcon, setSkillIcon] = useState("");

  const { data: categories = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "skills"],
    queryFn: () => adminApi.skills.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<SkillCategory>) => adminApi.skills.create(data),
    onSuccess: () => {
      toast.success("Skill category created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "skills"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create skill category";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SkillCategory> }) =>
      adminApi.skills.update(id, data),
    onSuccess: () => {
      toast.success("Skill category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "skills"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.skills.delete(id),
    onSuccess: () => {
      toast.success("Skill category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "skills"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setSkillsList([]);
    setSkillName("");
    setSkillIcon("");
    setIsVisible(true);
    setEditingCategory(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (category: SkillCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setSkillsList(category.skillsList || []);
    setIsVisible(category.isVisible);
    setModalOpen(true);
  };

  const handleAddSkillItem = () => {
    if (!skillName.trim()) {
      toast.error("Skill name is required");
      return;
    }
    setSkillsList([
      ...skillsList,
      {
        name: skillName.trim(),
        icon: skillIcon.trim() || undefined,
      },
    ]);
    setSkillName("");
    setSkillIcon("");
  };

  const handleRemoveSkillItem = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleToggleVisible = (cat: SkillCategory) => {
    updateMutation.mutate({
      id: cat._id,
      data: { isVisible: !cat.isVisible },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload: Partial<SkillCategory> = {
      name: name.trim(),
      description: description.trim(),
      skillsList,
      isVisible,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Skills & Tech Stack</h1>
          <p className="text-xs text-muted-foreground">
            Group skills into domains (Languages, Frameworks, Cloud, Databases) with icons
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
            Add Skill Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/60 p-12 text-center text-xs text-muted-foreground">
          No skill categories registered. Click &quot;Add Skill Category&quot; to define your tech stack.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-semibold">{cat.name}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggleVisible(cat)}
                      title={cat.isVisible ? "Visible on portfolio" : "Hidden"}
                    >
                      {cat.isVisible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirmId(cat._id)}
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cat.description}</p>
                )}
              </div>

              <div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Skills ({(cat.skillsList || []).length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {(cat.skillsList || []).map((skill, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-2 py-1 text-xs"
                    >
                      {skill.icon ? (
                        <img src={skill.icon} alt="" className="h-4 w-4 object-contain" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-primary" />
                      )}
                      <span className="font-medium text-foreground text-[11px]">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingCategory ? "Edit Skill Category" : "New Skill Category"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manage group title and the individual technologies under this domain.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="catName" className="text-xs font-medium">
                  Category Name *
                </Label>
                <Input
                  id="catName"
                  required
                  placeholder="e.g. Programming Languages, Cloud & DevOps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="catDesc" className="text-xs font-medium">
                  Description
                </Label>
                <Textarea
                  id="catDesc"
                  rows={2}
                  placeholder="Summary of your proficiency in this area..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-3">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Skill Items ({skillsList.length})
                </span>

                {skillsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {skillsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs"
                      >
                        {item.icon && <img src={item.icon} alt="" className="h-3.5 w-3.5 object-contain" />}
                        <span className="font-medium text-foreground">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillItem(idx)}
                          className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Input
                    placeholder="Skill Name (e.g. TypeScript)"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="h-7 text-xs bg-card"
                  />
                  <Input
                    placeholder="Icon SVG / Devicon URL (optional)"
                    value={skillIcon}
                    onChange={(e) => setSkillIcon(e.target.value)}
                    className="h-7 text-xs bg-card"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSkillItem}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Skill to Category
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                <Label htmlFor="isVisible" className="text-xs font-medium cursor-pointer">
                  Visible on Portfolio
                </Label>
                <Switch id="isVisible" checked={isVisible} onCheckedChange={setIsVisible} />
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
                  "Save Category"
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
              Delete Skill Category
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this skill category and all its skills?
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

