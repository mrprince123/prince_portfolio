import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../lib/adminApi";
import { ContactMessage } from "../types";
import {
  Mail,
  Search,
  Reply,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  User,
  Phone,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";

export const ContactsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "replied">("all");
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: contacts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: () => adminApi.contacts.getAll(),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      adminApi.contacts.reply(id, message),
    onSuccess: () => {
      toast.success("Reply email sent successfully via SMTP");
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setReplyOpen(false);
      setReplyText("");
      setSelectedContact(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to send email reply";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.contacts.delete(id),
    onSuccess: () => {
      toast.success("Inquiry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
      setDeleteConfirmId(null);
      if (selectedContact?._id === deleteConfirmId) {
        setSelectedContact(null);
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete inquiry";
      toast.error(msg);
    },
  });

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "pending") return !c.isReplied;
    if (filterTab === "replied") return c.isReplied;
    return true;
  });

  const pendingCount = contacts.filter((c) => !c.isReplied).length;
  const repliedCount = contacts.filter((c) => c.isReplied).length;

  const handleOpenReply = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setReplyText(contact.replyMessage || "");
    setReplyOpen(true);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    replyMutation.mutate({ id: selectedContact._id, message: replyText.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Contact Inquiries</h1>
          <p className="text-xs text-muted-foreground">
            Manage inquiries, messages, and email replies directly with clients
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
            Refresh ({contacts.length})
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-1">
          <Button
            variant={filterTab === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterTab("all")}
            className="h-7 px-3 text-xs"
          >
            All ({contacts.length})
          </Button>
          <Button
            variant={filterTab === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterTab("pending")}
            className="h-7 px-3 text-xs text-amber-600 dark:text-amber-400"
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filterTab === "replied" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterTab("replied")}
            className="h-7 px-3 text-xs text-emerald-600 dark:text-emerald-400"
          >
            Replied ({repliedCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No inquiries match the current search or filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3 cursor-pointer"
                onClick={() => setSelectedContact(item)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">&lt;{item.email}&gt;</span>
                    {item.isReplied ? (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      >
                        <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                        Replied
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      >
                        <Clock className="mr-1 h-2.5 w-2.5" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-foreground">{item.subject}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-muted-foreground font-mono mr-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1 border-border/60 hover:bg-secondary"
                    onClick={() => handleOpenReply(item)}
                  >
                    <Reply className="h-3 w-3" />
                    <span>{item.isReplied ? "View Reply" : "Reply"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(item._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedContact && !replyOpen} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Inquiry Details</span>
              {selectedContact?.isReplied ? (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                  Replied
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                  Pending Response
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 border border-border/50">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">From</p>
                    <p className="font-medium">{selectedContact.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Email</p>
                    <p className="font-mono">{selectedContact.email}</p>
                  </div>
                </div>
                {selectedContact.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Phone</p>
                      <p className="font-mono">{selectedContact.mobile}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Received</p>
                    <p className="font-mono">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </Label>
                <p className="text-xs font-semibold text-foreground mt-0.5">{selectedContact.subject}</p>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Message
                </Label>
                <div className="mt-1 rounded-lg border border-border/60 bg-muted/10 p-3 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              {selectedContact.isReplied && selectedContact.replyMessage && (
                <div>
                  <Label className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Sent Reply
                  </Label>
                  <div className="mt-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedContact.replyMessage}
                  </div>
                  {selectedContact.replied_at && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      Sent at: {new Date(selectedContact.replied_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                if (selectedContact) setDeleteConfirmId(selectedContact._id);
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSelectedContact(null)}>
                Close
              </Button>
              {selectedContact && (
                <Button size="sm" className="text-xs h-8 gap-1" onClick={() => setReplyOpen(true)}>
                  <Reply className="h-3.5 w-3.5" />
                  {selectedContact.isReplied ? "Update Reply" : "Compose Reply"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSendReply}>
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Reply to {selectedContact?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                This will send an official email to <span className="font-mono font-medium text-foreground">{selectedContact?.email}</span> via Nodemailer SMTP.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="rounded-lg bg-muted/30 p-2.5 border border-border/50">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Original Inquiry Subject</p>
                <p className="font-semibold text-foreground">{selectedContact?.subject}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="replyText" className="text-xs font-medium">
                  Your Reply Message
                </Label>
                <Textarea
                  id="replyText"
                  rows={6}
                  required
                  placeholder="Hi Prince, thank you for contacting me. Regarding your query..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setReplyOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={replyMutation.isPending}
                className="text-xs h-8 gap-1.5"
              >
                {replyMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Email Reply
                  </>
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
              Delete Contact Inquiry
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this message? This action is permanent and cannot be undone.
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

