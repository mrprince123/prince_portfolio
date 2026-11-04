import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { Testimonial } from "../types";
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  User,
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

export const TestimonialsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const { data: testimonials = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: () => adminApi.testimonials.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Testimonial>) => adminApi.testimonials.create(data),
    onSuccess: () => {
      toast.success("Testimonial added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add testimonial";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      adminApi.testimonials.update(id, data),
    onSuccess: () => {
      toast.success("Testimonial updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update testimonial";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.testimonials.delete(id),
    onSuccess: () => {
      toast.success("Testimonial deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete testimonial";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setName("");
    setDesignation("");
    setProfilePic("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
    setMessage("");
    setIsVisible(true);
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setDesignation(item.designation);
    setProfilePic(item.profilePic);
    setMessage(item.message);
    setIsVisible(item.isVisible);
    setModalOpen(true);
  };

  const handleToggleVisible = (item: Testimonial) => {
    updateMutation.mutate({
      id: item._id,
      data: { isVisible: !item.isVisible },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim() || !message.trim()) {
      toast.error("Please fill in Name, Designation, and Message");
      return;
    }

    const payload: Partial<Testimonial> = {
      name: name.trim(),
      designation: designation.trim(),
      profilePic: profilePic.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      message: message.trim(),
      isVisible,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Testimonials & Reviews</h1>
          <p className="text-xs text-muted-foreground">
            Manage peer endorsements, client recommendations, and feedback quotes
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
            Add Testimonial
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No testimonials found. Click &quot;Add Testimonial&quot; to showcase your first recommendation.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Message Quote</th>
                  <th className="px-4 py-3 text-center">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {testimonials.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {item.profilePic ? (
                          <img
                            src={item.profilePic}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover border border-border/50 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">{item.designation}</td>

                    <td className="px-4 py-3.5 max-w-sm">
                      <p className="line-clamp-2 text-foreground/90 italic">&ldquo;{item.message}&rdquo;</p>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteConfirmId(item._id)}
                          title="Delete"
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
            {testimonials.map((item) => (
              <div key={item._id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {item.profilePic ? (
                    <img
                      src={item.profilePic}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-border/50 shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{item.designation}</p>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 italic bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  &ldquo;{item.message}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
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
                        <EyeOff className="h-3.5 w-3.5" /> Hidden
                      </span>
                    )}
                  </button>

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingItem ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record endorsement details from colleagues, clients, or leaders.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Client / Peer Name *
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="designation" className="text-xs font-medium">
                  Designation & Company *
                </Label>
                <Input
                  id="designation"
                  required
                  placeholder="e.g. Senior VP of Engineering at Tech Corp"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profilePic" className="text-xs font-medium">
                  Profile Picture URL *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="profilePic"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  {profilePic && (
                    <img
                      src={profilePic}
                      alt="Preview"
                      className="h-8 w-8 rounded-full object-cover border border-border/50 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-medium">
                  Message / Quote * (Max 500 characters)
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Prince demonstrated deep full-stack mastery and delivered exceptionally robust systems..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-xs leading-relaxed"
                />
                <span className="text-[10px] text-muted-foreground font-mono">
                  {message.length}/500 chars
                </span>
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
                  "Save Testimonial"
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
              Delete Testimonial
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this recommendation?
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

