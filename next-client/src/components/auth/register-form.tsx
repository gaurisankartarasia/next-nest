"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useRegisterMutation } from "@/lib/redux/api/authApi";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { useAppDispatch } from "@/lib/redux/store";
import { type RegisterFormData, registerSchema } from "@/lib/validations/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: selectedRole,
      }).unwrap();
      dispatch(setCredentials(response));
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(
        err?.error ||
          err?.data?.[0]?.message ||
          err?.message ||
          err?.data?.message ||
          "Failed to create account. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="register-name">Full Name</Label>
        <Input
          id="register-name"
          placeholder="Jane Doe"
          disabled={isLoading}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-email">Email Address</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          disabled={isLoading}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-confirm-password">Confirm Password</Label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Assign Initial Role (For Authorization Testing)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={selectedRole === "USER" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole("USER")}
            disabled={isLoading}
          >
            User (Standard)
          </Button>
          <Button
            type="button"
            variant={selectedRole === "ADMIN" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole("ADMIN")}
            disabled={isLoading}
          >
            Admin (Elevated)
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="size-4" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
}
