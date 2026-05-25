"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import type { Announcement, Priority } from "@/types";
import { formatDateTime, formatDistanceToNow } from "@/lib/date-utils";

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  LOW: "bg-muted text-muted-foreground border-muted",
};

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.getAnnouncementById(id);
        setAnnouncement(response.data?.announcement || null);
      } catch (error) {
        console.error(" Failed to fetch announcement:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleMarkAsRead = async () => {
    if (!announcement || announcement.isRead) return;

    setIsMarking(true);
    try {
      await api.markAnnouncementAsRead(id);
      setAnnouncement({ ...announcement, isRead: true });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAnnouncement(id);
      router.push("/dashboard/announcements");
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-medium mb-1">Announcement not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This announcement may have been deleted or you don&apos;t have
              access.
            </p>
            <Link href="/dashboard/announcements">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/announcements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-balance">
                {announcement.title}
              </h1>
              <Badge
                variant="outline"
                className={priorityColors[announcement.priority]}
              >
                {announcement.priority}
              </Badge>
              {user?.role !== "ADMIN" && announcement.isRead && (
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Read
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Posted {formatDistanceToNow(announcement.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!announcement.isRead && user?.role !== "ADMIN" && (
            <Button
              variant="outline"
              onClick={handleMarkAsRead}
              disabled={isMarking}
            >
              {isMarking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Read
            </Button>
          )}

          {user?.role === "ADMIN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this announcement? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{announcement.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {formatDateTime(announcement.createdAt)}
              </p>
            </div>
          </div>

          {announcement.dueDate && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-sm font-medium">
                  {formatDateTime(announcement.dueDate)}
                </p>
              </div>
            </div>
          )}

          {announcement.type && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-sm font-medium">
                  {announcement.type.replace("_", " ")}
                </p>
              </div>
            </div>
          )}

          {announcement.maxScore && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">
                  {announcement.maxScore}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Score</p>
                <p className="text-sm font-medium">
                  {announcement.maxScore} points
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      {announcement.attachments && announcement.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcement.attachments.map((attachment, index) => (
              <a
                key={index}
                href={
                  attachment.signedUrl ||
                  `${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001"}${attachment.fileUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{attachment.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.fileType}
                    </p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
