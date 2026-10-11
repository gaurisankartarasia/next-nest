"use client";

import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitializing && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isInitializing, router]);

  if (!mounted || isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Spinner className="size-8 text-primary mb-2" />
        <p className="text-xs text-muted-foreground">
          Verifying administrative permissions...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <Alert variant="destructive" className="text-left">
            <AlertTitle className="text-sm font-semibold">
              Access Denied (403)
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Your account ({user?.email}) does not have the{" "}
              <strong>ADMIN</strong> role required to access the Admin Console.
            </AlertDescription>
          </Alert>
          <div className="pt-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 text-xs",
              )}
            >
              <ArrowLeft className="size-3.5" />
              Return to User Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
