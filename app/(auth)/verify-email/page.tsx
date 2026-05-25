"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        await api.verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Verification failed"
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md border-border/50 shadow-sm">
      <CardContent className="pt-6 text-center">
        {status === "loading" && (
          <>
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Verifying your email...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Email Verified!</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Link href="/login">
              <Button className="w-full">Continue to Sign In</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md border-border/50 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
