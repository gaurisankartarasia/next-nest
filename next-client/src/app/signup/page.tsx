"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/store";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
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
            <UserPlus className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>
            Register with role assignment for authorization testing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <RegisterForm onSuccess={() => router.push("/")} />
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-muted/10 py-3 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="ml-1 font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
