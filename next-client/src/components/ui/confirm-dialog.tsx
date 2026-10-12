"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  /** Controlled open state */
  open: boolean;
  /** Callback when open state changes (e.g. dismissed by clicking backdrop/escape) */
  onOpenChange: (open: boolean) => void;
  /** Title of the confirmation dialog */
  title: React.ReactNode;
  /** Descriptive explanation or warning */
  description?: React.ReactNode;
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: React.ReactNode;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: React.ReactNode;
  /** Variant for the confirm button ("default" | "destructive" | "outline" | etc.) */
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Callback triggered when the confirm button is clicked */
  onConfirm: () => void | Promise<void>;
  /** Callback triggered when the cancel button or backdrop is clicked */
  onCancel?: () => void;
  /** If true, disables buttons and shows loading spinner in confirm button */
  isLoading?: boolean;
  /** Size of the alert dialog ("default" | "sm") */
  size?: "default" | "sm";
  /** Additional custom class names for the dialog content */
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  size = "default",
  className,
}: ConfirmDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (isLoading) return; // Prevent closing while action is in flight
      onCancel?.();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size={size} className={cn("max-w-md", className)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            variant={confirmVariant}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Spinner className="size-3.5" />
                <span>Processing...</span>
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

