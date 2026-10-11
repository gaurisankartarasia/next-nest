"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Cookie,
  KeyRound,
  LogOut,
  RefreshCw,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  type User,
  useLazyGetUsersQuery,
  useLogoutMutationMutation,
  useRefreshTokenMutation,
} from "@/lib/redux/api/authApi";
import { logout, setCredentials } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

export function UserProfile() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const [logoutMutation, { isLoading: isLoggingOut }] =
    useLogoutMutationMutation();
  const [triggerRefreshToken, { isLoading: isRefreshing }] =
    useRefreshTokenMutation();
  const [triggerGetUsers, { isLoading: isLoadingUsers }] =
    useLazyGetUsersQuery();

  const [usersList, setUsersList] = useState<User[] | null>(null);
  const [authTestStatus, setAuthTestStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Clear in-memory state regardless
    } finally {
      dispatch(logout());
    }
  };

  const handleRefreshToken = async () => {
    setRefreshSuccess(false);
    try {
      // Automatically sends httpOnly cookie with credentials: include
      const result = await triggerRefreshToken().unwrap();
      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          user: result.user,
        }),
      );
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 4000);
    } catch (err: any) {
      console.error("Token refresh failed", err);
    }
  };

  const handleTestAuthorization = async () => {
    setAuthTestStatus(null);
    setUsersList(null);
    try {
      const res = await triggerGetUsers().unwrap();
      setUsersList(res);
      setAuthTestStatus({
        success: true,
        message: `Authorization Granted! Retrieved ${res.length} user record(s) with ADMIN role.`,
      });
    } catch (err: any) {
      setAuthTestStatus({
        success: false,
        message:
          err?.error ||
          err?.data?.[0]?.message ||
          err?.message ||
          "Authorization Denied: Endpoint requires elevated role (ADMIN).",
      });
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-2xl shadow-xl border border-border/60">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCheck className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {user.name || "Authenticated User"}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs gap-1.5 h-8 font-medium",
              )}
            >
              <Users className="size-3.5 text-primary" />
              <span>Users Table</span>
            </Link>
            <Badge
              variant={user.role === "ADMIN" ? "destructive" : "default"}
              className="text-xs uppercase tracking-wider"
            >
              <Shield className="size-3 mr-1" />
              {user.role} Role
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {refreshSuccess && (
          <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle>Tokens Rotated Successfully</AlertTitle>
            <AlertDescription>
              Old refresh token invalidated in database and replaced with new
              httpOnly cookie. New access token stored in memory.
            </AlertDescription>
          </Alert>
        )}

        {authTestStatus && (
          <Alert
            variant={authTestStatus.success ? "default" : "destructive"}
            className={
              authTestStatus.success
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                : ""
            }
          >
            {authTestStatus.success ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
            <AlertTitle>
              {authTestStatus.success
                ? "RBAC Authorization Passed"
                : "RBAC Authorization Guard Result"}
            </AlertTitle>
            <AlertDescription>{authTestStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Security Architecture Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <KeyRound className="size-4 text-primary" />
              Access Token (In-Memory)
            </div>
            <p className="text-muted-foreground">
              Stored strictly in Redux memory. Never written to localStorage or
              sessionStorage.
            </p>
          </div>
          <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Cookie className="size-4 text-emerald-600 dark:text-emerald-400" />
              Refresh Token (HttpOnly Cookie)
            </div>
            <p className="text-muted-foreground">
              Stored in secure httpOnly cookie with SameSite protection and
              Argon2 database rotation.
            </p>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border bg-card p-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">User ID</span>
            <span className="font-mono font-medium">{user.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              Role Level
            </span>
            <span className="font-medium">{user.role}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">
              Session State
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Active (Verified in Redux)
            </span>
          </div>
        </div>

        {/* In-Memory Access Token Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              In-Memory Access Token Preview
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={handleRefreshToken}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Spinner className="size-3" />
              ) : (
                <RefreshCw className="size-3" />
              )}
              Rotate Refresh Token
            </Button>
          </div>
          <div className="rounded-md bg-muted p-2.5 font-mono text-xs break-all line-clamp-2 select-all text-muted-foreground">
            {accessToken || "No access token in memory"}
          </div>
        </div>

        {/* Authorization test section */}
        <div className="rounded-lg border p-4 space-y-3 bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm">
                Test Role-Based Authorization
              </h4>
              <p className="text-xs text-muted-foreground">
                Executes GraphQL <code className="font-mono">users</code> query
                protected by{" "}
                <code className="font-mono">@Roles(&apos;ADMIN&apos;)</code> and{" "}
                <code className="font-mono">RolesGuard</code>.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestAuthorization}
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? (
                <Spinner className="size-4" />
              ) : (
                <Users className="size-4" />
              )}
              Query All Users
            </Button>
          </div>

          {usersList && usersList.length > 0 && (
            <div className="mt-3 border rounded-md divide-y text-xs">
              <div className="p-2 font-semibold bg-muted/40 grid grid-cols-4">
                <span>ID</span>
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
              </div>
              {usersList.map((u) => (
                <div key={u.id} className="p-2 grid grid-cols-4 items-center">
                  <span className="font-mono">{u.id}</span>
                  <span>{u.name || "—"}</span>
                  <span className="truncate">{u.email}</span>
                  <span>
                    <Badge variant="outline" className="text-[10px]">
                      {u.role}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t bg-muted/20">
        <span className="text-xs text-muted-foreground">
          Logged in as <strong className="text-foreground">{user.email}</strong>
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-2"
        >
          {isLoggingOut ? (
            <Spinner className="size-4" />
          ) : (
            <LogOut className="size-4" />
          )}
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}
