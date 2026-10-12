"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface CaptchaProps {
  imageSrc?: string;
  isLoading?: boolean;
  onRefresh: () => void;
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function Captcha({
  imageSrc,
  isLoading = false,
  onRefresh,
  value,
  onChange,
  error,
  disabled = false,
}: CaptchaProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="captcha-code" className="text-xs font-medium flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Security Verification</span>
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || disabled}
          className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          title="Regenerate captcha from server"
        >
          <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
          <span className="text-[11px]">Refresh</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="relative flex items-center justify-center w-[140px] h-[44px] rounded-md border border-border/80 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-xs shrink-0 select-none cursor-pointer"
          onClick={onRefresh}
          title="Click to reload code"
        >
          {isLoading ? (
            <Spinner className="size-4 text-muted-foreground" />
          ) : imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt="Security captcha"
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <span className="text-[11px] text-muted-foreground">No captcha</span>
          )}
        </div>

        <Input
          id="captcha-code"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Enter code"
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled || isLoading}
          className={cn(
            "uppercase font-mono tracking-widest text-center text-sm",
            error && "border-b-destructive text-destructive",
          )}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
