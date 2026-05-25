"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { Announcement } from "@/types";
import { formatDistanceToNow } from "@/lib/date-utils";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  const priorityColors = {
    HIGH: "bg-destructive/10 text-destructive border-destructive/20",
    MEDIUM: "bg-warning/10 text-warning border-warning/20",
    LOW: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <Link
      href={`/dashboard/announcements/${announcement.id}`}
      className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{announcement.title}</h3>
            <Badge
              variant="outline"
              className={priorityColors[announcement.priority]}
            >
              {announcement.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {announcement.content}
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(announcement.createdAt)}
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<
    Announcement[]
  >([]);
  const [readAnnouncements, setReadAnnouncements] = useState<Announcement[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    unreadCount: 0,
    totalUsers: 0,
  });

 useEffect(() => {
   if (!user?.id) return;

   const fetchData = async () => {
     setIsLoading(true);

     try {
       const [unreadRes, readRes, allRes] = await Promise.all([
         api.getUserAnnouncements(user.id, "unread", 1, 5),
         api.getUserAnnouncements(user.id, "read", 1, 5),
         api.getAllAnnouncements(1, 1),
       ]);

       setUnreadAnnouncements(unreadRes.data?.unread || []);
       setReadAnnouncements(readRes.data?.read || []);
       setStats({
         totalAnnouncements: allRes.pagination?.total || 0,
         unreadCount: unreadRes.pagination?.total || 0,
         totalUsers: 0,
       });
     } catch (error) {
       console.error("Failed to fetch dashboard data:", error);
     } finally {
       setIsLoading(false);
     }
   };

   fetchData();
 }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-balance">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's what's happening in your organization today."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Announcements"
              value={stats.totalAnnouncements}
              icon={Bell}
            />
            <StatCard
              title="Unread"
              value={stats.unreadCount}
              icon={AlertCircle}
            />
            <StatCard
              title="Team Members"
              value={stats.totalUsers || "—"}
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Recent Announcements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Unread Announcements</CardTitle>
            <Link href="/dashboard/announcements?status=unread">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
            {isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : unreadAnnouncements.length > 0 ? (
              unreadAnnouncements.map((announcement) => (
                <AnnouncementItem
                  key={announcement.id}
                  announcement={announcement}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No unread announcements</p>
                <p className="text-sm">{"You're all caught up!"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Read Announcements</CardTitle>
            <Link href="/dashboard/announcements?status=read">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 flex-1">
            {isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : readAnnouncements.length > 0 ? (
              readAnnouncements.map((announcement) => (
                <AnnouncementItem
                  key={announcement.id}
                  announcement={{ ...announcement, isRead: true }}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No read announcements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
