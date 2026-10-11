import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UserForm } from "@/components/users/user-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit User | Admin",
  description: "Edit user account details, credentials, and permissions.",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Spinner className="size-8 text-primary mb-3" />
          <p className="text-xs text-muted-foreground">Loading user form...</p>
        </div>
      }
    >
      <UserForm initialUserId={id} />
    </Suspense>
  );
}

