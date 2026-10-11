import { z } from "zod";

export const USER_ROLES = ["USER", "ADMIN"] as const;
export const USER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "BANNED",
  "DELETED",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export const userRoleSchema = z.enum(USER_ROLES);
export const userStatusSchema = z.enum(USER_STATUSES);

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters if provided",
    }),
  role: userRoleSchema,
  status: userStatusSchema,
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const userStatusUpdateSchema = z.object({
  status: userStatusSchema,
});

export type UserStatusUpdateData = z.infer<typeof userStatusUpdateSchema>;
