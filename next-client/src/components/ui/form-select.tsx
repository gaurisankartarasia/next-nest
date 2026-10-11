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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface FormSelectProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control?: Control<T, any>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  options: FormSelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
}

export function FormSelect<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  placeholder = "Select an option",
  options,
  error: customError,
  disabled = false,
  required = false,
  fieldClassName,
  labelClassName,
  triggerClassName,
  contentClassName,
  id: explicitId,
}: FormSelectProps<T>) {
  const formContext = useFormContext<T>();
  const activeControl = control || formContext?.control;

  if (!activeControl) {
    throw new Error(
      `FormSelect: No control provided for field "${name}". Either pass the "control" prop or wrap your form in <FormProvider>.`,
    );
  }

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control: activeControl,
  });

  const fieldId = explicitId || `form-select-${name}`;
  const displayError = customError || fieldError?.message;

  // Create an items lookup map for @base-ui/react select value resolution
  const itemsMap: Record<string, React.ReactNode> = {};
  for (const opt of options) {
    itemsMap[opt.value] = opt.label;
  }

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

      <Select
        items={itemsMap}
        value={field.value ?? ""}
        onValueChange={(val) => {
          field.onChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger
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
          className={cn(
            "w-full justify-between font-normal text-left",
            !field.value && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={cn("w-(--anchor-width)", contentClassName)}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
