"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Logo size="large" />
      <div className="mt-8 text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try Again</Button>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
