"use client";

import type * as React from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormInputProps<T extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue"> {
  name: Path<T>;
  control?: Control<T, any>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  fieldClassName?: string;
  labelClassName?: string;
  required?: boolean;
}

export function FormInput<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  error: customError,
  fieldClassName,
  labelClassName,
  required,
  id: explicitId,
  disabled,
  className,
  ...props
}: FormInputProps<T>) {
  const formContext = useFormContext<T>();
  const activeControl = control || formContext?.control;

  if (!activeControl) {
    throw new Error(
      `FormInput: No control provided for field "${name}". Either pass the "control" prop or wrap your form in <FormProvider>.`,
    );
  }

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control: activeControl,
  });

  const fieldId = explicitId || `form-input-${name}`;
  const displayError = customError || fieldError?.message;

  return (
    <Field className={cn("gap-1.5", fieldClassName)}>
      {label && (
        <FieldLabel htmlFor={fieldId} className={labelClassName}>
          {label}
          {required && (
            <span
              className="text-destructive font-semibold ml-0.5"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </FieldLabel>
      )}
      <Input
        id={fieldId}
        disabled={disabled}
        aria-invalid={Boolean(displayError)}
        aria-describedby={
          displayError
            ? `${fieldId}-error`
            : description
              ? `${fieldId}-description`
              : undefined
        }
        className={className}
        {...field}
        value={field.value ?? ""}
        {...props}
      />
      {description && !displayError && (
        <FieldDescription id={`${fieldId}-description`}>
          {description}
        </FieldDescription>
      )}
      {displayError && (
        <FieldError id={`${fieldId}-error`}>{displayError}</FieldError>
      )}
    </Field>
  );
}
