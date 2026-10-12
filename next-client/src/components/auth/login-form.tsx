"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetCaptchaQuery,
  useLazyGetCaptchaQuery,
  useLoginMutation,
} from "@/lib/redux/api/authApi";
import { setCredentials } from "@/lib/redux/slices/authSlice";
import { useAppDispatch } from "@/lib/redux/store";
import { Captcha } from "@/components/auth/captcha";
import { type LoginFormData, loginSchema } from "@/lib/validations/auth";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Server-side Captcha
  const {
    data: captchaData,
    isLoading: isCaptchaLoading,
    refetch: refetchCaptcha,
  } = useGetCaptchaQuery();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaCode: "",
    },
  });

  const captchaCodeValue = watch("captchaCode") || "";

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);

    if (!captchaData?.captchaId) {
      setErrorMessage("Captcha is loading. Please wait a moment.");
      return;
    }

    try {
      const response = await login({
        email: data.email,
        password: data.password,
        captchaId: captchaData.captchaId,
        captchaCode: data.captchaCode.trim().toUpperCase(),
      }).unwrap();

      dispatch(setCredentials(response));
      onSuccess?.();
    } catch (err: any) {
      // Refresh captcha on failure so an expired/used code is renewed
      refetchCaptcha();
      setValue("captchaCode", "");

      // Extract exact human-friendly message from GraphQL or RTK Query error
      const message =
        err?.error ||
        err?.data?.[0]?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to sign in. Please verify your credentials.";

      setErrorMessage(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="size-4 shrink-0" />
          <div className="space-y-1">
            <AlertTitle className="font-semibold">Sign In Failed</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">{errorMessage}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email Address</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="username"
          disabled={isLoading}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Captcha
        imageSrc={captchaData?.image}
        isLoading={isCaptchaLoading}
        onRefresh={() => {
          refetchCaptcha();
          setValue("captchaCode", "");
        }}
        value={captchaCodeValue}
        onChange={(val) => {
          setValue("captchaCode", val, { shouldValidate: true });
        }}
        error={errors.captchaCode?.message}
        disabled={isLoading}
      />

      <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner className="size-4" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="size-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}
