"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/store";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-lg border border-border/60">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Sign In
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <LoginForm onSuccess={() => router.push("/")} />
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-muted/10 py-3 text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="ml-1 font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
