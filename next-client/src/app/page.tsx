"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/store";
import { UserProfile } from "@/components/auth/user-profile";
import { Spinner } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Spinner className="size-8 text-primary mb-2" />
        <p className="text-xs text-muted-foreground">
          Checking authentication session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Authentication Required
          </h1>
          <p className="text-sm text-muted-foreground">
            Please sign in to access your session.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }), "gap-2")}
            >
              <LogIn className="size-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <UserPlus className="size-4" />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-muted/20">
      <UserProfile />
    </div>
  );
}
