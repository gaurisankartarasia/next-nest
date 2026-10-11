"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Save,
  Shield,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { PageLayout } from "@/components/layout/page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/lib/redux/api/authApi";
import { useAppSelector } from "@/lib/redux/store";
import { type UserFormData, userFormSchema } from "@/lib/validations/user";
import { cn } from "@/lib/utils";

interface UserFormProps {
  initialUserId?: string;
}

export function UserForm({ initialUserId }: UserFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("id") || searchParams.get("edit");
  const userId = initialUserId || queryUserId;
  const isEditMode = Boolean(userId);

  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const {
    data: existingUser,
    isLoading: isLoadingExisting,
    isError: isLoadError,
    error: loadError,
  } = useGetUserByIdQuery(userId as string, {
    skip: !isEditMode || !userId,
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
    },
  });

  // Populate form values when existing user data arrives in edit mode
  useEffect(() => {
    if (isEditMode && existingUser) {
      form.reset({
        name: existingUser.name || "",
        email: existingUser.email || "",
        password: "", // Kept blank for security; optional in edit mode
        role: (existingUser.role as "USER" | "ADMIN") || "USER",
        status:
          (existingUser.status as
            | "ACTIVE"
            | "INACTIVE"
            | "BANNED"
            | "DELETED") || "ACTIVE",
      });
    }
  }, [isEditMode, existingUser, form]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  const onSubmit = async (data: UserFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate password requirement in create mode
    if (!isEditMode && (!data.password || data.password.trim().length < 6)) {
      form.setError("password", {
        type: "manual",
        message:
          "Password is required (minimum 6 characters) for new user accounts",
      });
      return;
    }

    try {
      if (isEditMode && userId) {
        await updateUser({
          id: userId,
          name: data.name?.trim() ? data.name.trim() : undefined,
          email: data.email.trim(),
          password: data.password?.trim() ? data.password.trim() : undefined,
          role: data.role,
          status: data.status,
        }).unwrap();

        setSuccessMessage("User account updated successfully!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 1200);
      } else {
        await createUser({
          name: data.name?.trim() ? data.name.trim() : undefined,
          email: data.email.trim(),
          password: data.password!,
          role: data.role,
          status: data.status,
        }).unwrap();

        setSuccessMessage("User created successfully!");
        setTimeout(() => {
          router.push("/admin/users");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.error ||
          err?.data?.[0]?.message ||
          err?.message ||
          "Failed to process user operation. Please check your inputs and try again.",
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  if (isInitializing || (isEditMode && isLoadingExisting)) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="size-8 text-primary mb-3" />
        <p className="text-sm text-muted-foreground">
          {isEditMode ? "Loading user details..." : "Preparing form..."}
        </p>
      </div>
    );
  }

  return (
    <PageLayout
      title={isEditMode ? "Edit User" : "Create User"}
      description={
        isEditMode
          ? "Update account profile, access role, and account status."
          : "Add a new user with designated credentials, roles, and status."
      }
      badge={
        <Badge
          variant={isEditMode ? "outline" : "secondary"}
          className="text-xs font-semibold"
        >
          {isEditMode ? `ID #${userId}` : "New User"}
        </Badge>
      }
      actions={
        <Link
          href="/admin/users"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 text-xs h-8",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Users</span>
        </Link>
      }
    >
      <div className="w-full space-y-6">
        {/* Load Error Alert */}
        {isEditMode && isLoadError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading User</AlertTitle>
            <AlertDescription className="text-xs">
              {(loadError as any)?.error ||
                (loadError as any)?.data?.[0]?.message ||
                "Failed to fetch user data for editing. The user may not exist."}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Error Alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription className="text-xs">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-xs">
              {successMessage} Redirecting to users directory...
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xs border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {isEditMode ? (
                <>
                  <UserCheck className="size-4 text-primary" />
                  <span>Edit User Profile & Permissions</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4 text-primary" />
                  <span>New User Account Details</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {isEditMode
                ? "Modify credentials and access states. Leave the password blank if no changes are intended."
                : "Fill in user identity, initial password, and permission status."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {/* Full Name Input */}
                <FormInput
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  disabled={isSubmitting}
                  description="User's full display name."
                />

                {/* Email Address Input */}
                <FormInput
                  control={form.control}
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="user@example.com"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  description="Primary login email address."
                />

                {/* Password Input */}
                <FormInput
                  control={form.control}
                  name="password"
                  type="password"
                  label={
                    isEditMode
                      ? "Password (leave blank to keep unchanged)"
                      : "Password"
                  }
                  placeholder={
                    isEditMode ? "••••••••" : "At least 6 characters"
                  }
                  autoComplete={
                    isEditMode ? "new-password" : "current-password"
                  }
                  required={!isEditMode}
                  disabled={isSubmitting}
                  description={
                    isEditMode
                      ? "Only fill this if you want to set a new password."
                      : "Must be at least 6 characters."
                  }
                />

                <Separator className="my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role Select */}
                  <FormSelect
                    control={form.control}
                    name="role"
                    label="User Role"
                    required
                    disabled={isSubmitting}
                    placeholder="Select Role"
                    options={[
                      {
                        value: "USER",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">USER</span>
                            <span className="text-xs text-muted-foreground">
                              (Standard)
                            </span>
                          </div>
                        ),
                      },
                      {
                        value: "ADMIN",
                        label: (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-destructive">
                              ADMIN
                            </span>
                            <span className="text-xs text-muted-foreground">
                              (Full Access)
                            </span>
                          </div>
                        ),
                      },
                    ]}
                    description="Defines access authorization."
                  />

                  {/* Status Select */}
                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Account Status"
                    required
                    disabled={isSubmitting}
                    placeholder="Select Status"
                    options={[
                      {
                        value: "ACTIVE",
                        label: (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                            <span>Active</span>
                          </div>
                        ),
                      },
                      {
                        value: "INACTIVE",
                        label: (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-amber-500 inline-block" />
                            <span>Inactive</span>
                          </div>
                        ),
                      },
                      {
                        value: "BANNED",
                        label: (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-red-500 inline-block" />
                            <span>Banned</span>
                          </div>
                        ),
                      },
                      {
                        value: "DELETED",
                        label: (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-slate-500 inline-block" />
                            <span>Deleted</span>
                          </div>
                        ),
                      },
                    ]}
                    description="Current activity state."
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => router.push("/admin/users")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="gap-2 min-w-28"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-3.5" />
                        <span>Saving...</span>
                      </>
                    ) : isEditMode ? (
                      <>
                        <Save className="size-3.5" />
                        <span>Update User</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-3.5" />
                        <span>Create User</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
