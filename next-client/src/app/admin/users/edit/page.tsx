import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UserForm } from "@/components/users/user-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit User | Admin",
  description: "Edit user account details and status.",
};

interface EditPageProps {
  searchParams: Promise<{ id?: string; edit?: string }>;
}

export default async function EditUserFallbackPage({
  searchParams,
}: EditPageProps) {
  const { id, edit } = await searchParams;
  const targetId = id || edit;

  if (targetId) {
    redirect(`/admin/users/edit/${targetId}`);
  }

  return (
    <Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="size-8 text-primary mb-3" />
          <p className="text-xs text-muted-foreground">Loading user form...</p>
        </div>
      }
    >
      <UserForm />
    </Suspense>
  );
}
