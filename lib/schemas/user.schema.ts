import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_SPECIAL_CHAR_REGEX =
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
  )
  .regex(
    PASSWORD_SPECIAL_CHAR_REGEX,
    "Password must contain at least one special character (!@#$%^&* etc.)",
  );

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().trim(),
  email: z.email("Invalid email address").trim().toLowerCase(),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
