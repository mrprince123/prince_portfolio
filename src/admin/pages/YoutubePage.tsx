import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { YoutubeVideo } from "../types";
import {
  Youtube,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Play,
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

export const YoutubePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<YoutubeVideo | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const { data: videos = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "youtube"],
    queryFn: () => adminApi.youtube.getAll(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<YoutubeVideo>) => adminApi.youtube.create(data),
    onSuccess: () => {
      toast.success("YouTube video added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "youtube"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to add video";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<YoutubeVideo> }) =>
      adminApi.youtube.update(id, data),
    onSuccess: () => {
      toast.success("Video updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "youtube"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update video";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.youtube.delete(id),
    onSuccess: () => {
      toast.success("Video deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "youtube"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete video";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setName("");
    setLink("");
    setThumbnail("https://dummyimage.com/1280x720/fff/aaa");
    setDescription("");
    setIsVisible(true);
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (item: YoutubeVideo) => {
    setEditingItem(item);
    setName(item.name);
    setLink(item.link);
    setThumbnail(item.thumbnail);
    setDescription(item.description);
    setIsVisible(item.isVisible);
    setModalOpen(true);
  };

  const handleToggleVisible = (item: YoutubeVideo) => {
    updateMutation.mutate({
      id: item._id,
      data: { isVisible: !item.isVisible },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !link.trim() || !description.trim()) {
      toast.error("Please fill in Name, YouTube Link, and Description");
      return;
    }

    const payload: Partial<YoutubeVideo> = {
      name: name.trim(),
      link: link.trim(),
      thumbnail: thumbnail.trim() || "https://dummyimage.com/1280x720/fff/aaa",
      description: description.trim(),
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">YouTube Videos</h1>
          <p className="text-xs text-muted-foreground">
            Manage video tutorials, coding sessions, and tech demonstrations
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
            Add Video
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
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No YouTube videos found. Click &quot;Add Video&quot; to showcase your technical video content.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Video</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {videos.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 rounded-md overflow-hidden bg-muted shrink-0 border border-border/50">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-md">
                      <p className="line-clamp-2 text-muted-foreground">{item.description}</p>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleVisible(item)}
                        title={item.isVisible ? "Visible on portfolio" : "Hidden"}
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
            {videos.map((item) => (
              <div key={item._id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Play className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                {editingItem ? "Edit YouTube Video" : "Add YouTube Video"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide video title, YouTube URL, and description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="vName" className="text-xs font-medium">
                  Video Title *
                </Label>
                <Input
                  id="vName"
                  required
                  placeholder="e.g. Building Scalable Microservices with Node.js"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vLink" className="text-xs font-medium">
                  YouTube Link *
                </Label>
                <Input
                  id="vLink"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vThumb" className="text-xs font-medium">
                  Thumbnail URL
                </Label>
                <Input
                  id="vThumb"
                  placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="vDesc" className="text-xs font-medium">
                  Description * (Min 10 characters)
                </Label>
                <Textarea
                  id="vDesc"
                  required
                  rows={3}
                  placeholder="Comprehensive walkthrough of modern system design and coding practices..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs leading-relaxed"
                />
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
                  "Save Video"
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
              Delete Video
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove this YouTube video entry?
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

