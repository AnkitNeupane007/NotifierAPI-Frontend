"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Announcement, Priority, Pagination } from "@/types";
import { formatDistanceToNow } from "@/lib/date-utils";

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  LOW: "bg-muted text-muted-foreground border-muted",
};

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Link href={`/dashboard/announcements/${announcement.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-medium">{announcement.title}</h3>
                <Badge
                  variant="outline"
                  className={priorityColors[announcement.priority]}
                >
                  {announcement.priority}
                </Badge>
                {announcement.isRead === false && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Unread
                  </Badge>
                )}
                {announcement.isRead === true && (
                  <Badge variant="secondary">Read</Badge>
                )}
              </div>
              {announcement.content && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {announcement.content}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(announcement.createdAt)}
                </span>
                {announcement.dueDate && (
                  <span>
                    Due: {new Date(announcement.dueDate).toLocaleDateString()}
                  </span>
                )}
                {(announcement as any).totalReads !== undefined && (
                  <span className="flex items-center gap-1 text-primary/80">
                    <Bell className="h-3 w-3" />
                    Read by: {(announcement as any).totalReads}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Read initial filter from URL if present without triggering suspense tree bailouts
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const f = p.get("status");
      if (f && (f === "read" || f === "unread")) {
        setReadFilter(f);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        let response;
        if (user?.role === "ADMIN") {
          response = await api.getAdminAnnouncements(currentPage, pageSize);
        } else {
          if (readFilter === "unread") {
            response = await api.getUserAnnouncements(
              user!.id,
              "unread",
              currentPage,
              pageSize,
            );
            // Re-map to match structure
            response = {
              ...response,
              data: {
                announcements: response.data?.unread?.map((a) => ({
                  ...a,
                  isRead: false,
                })),
              },
            };
          } else if (readFilter === "read") {
            response = await api.getUserAnnouncements(
              user!.id,
              "read",
              currentPage,
              pageSize,
            );
            response = {
              ...response,
              data: {
                announcements: response.data?.read?.map((a) => ({
                  ...a,
                  isRead: true,
                })),
              },
            };
          } else {
            response = await api.getAllAnnouncements(currentPage, pageSize);
          }
        }
        setAnnouncements(response.data?.announcements || []);
        // Safely extract pagination whether it's at root or nested in data
        const pageData =
          (response as any).pagination || response.data?.pagination || null;
        setPagination(pageData);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAnnouncements();
    }
  }, [currentPage, pageSize, readFilter, user]);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || announcement.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all announcements
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Link href="/dashboard/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          {user?.role !== "ADMIN" && (
            <Select
              value={readFilter}
              onValueChange={(val) => {
                setReadFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">No announcements found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first announcement to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground mr-2">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
