import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UsersClient } from "@/components/users/users-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Users | Admin",
  description: "Manage user accounts and roles.",
};

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="size-8 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">
            Loading users directory...
          </p>
        </div>
      }
    >
      <UsersClient inAdminLayout />
    </Suspense>
  );
}
