"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  "/login": {
    title: "Welcome Back",
    subtitle: "Classivo Management System",
  },
  "/register": {
    title: "Create Account",
    subtitle: "Join Classivo Management System",
  },
  "/forgot-password": {
    title: "Reset Password",
    subtitle: "Classivo Management System",
  },
  "/verify-email": {
    title: "Verify Email",
    subtitle: "Classivo Management System",
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const config = pageConfig[pathname] || pageConfig["/login"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center mb-8">
        <Logo size="large" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {config.title}
        </h1>
        <p className="text-muted-foreground text-sm">{config.subtitle}</p>
      </div>
      {children}
    </div>
  );
}
