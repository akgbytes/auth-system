import { resetPassword } from "../controllers/auth.controller";
import { boolean, z } from "zod";

const strongPassword = z
  .string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(16, { message: "Password must be at most 16 characters long" })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, number and one special character.",
  });

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),

  password: strongPassword,

  fullname: z
    .string()
    .min(6, { message: "Fullname must be at least 6 characters long" })
    .max(50, { message: "Fullname must be at most 50 characters long" }),
});

const loginSchema = registerSchema
  .pick({
    email: true,
    password: true,
  })
  .extend({
    rememberMe: z.boolean().default(false),
  });

const emailSchema = registerSchema.pick({
  email: true,
});

const changePasswordSchema = z
  .object({
    currentPassword: strongPassword,
    newPassword: strongPassword,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password must match the new password",
    path: ["confirmNewPassword"],
  });

const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match the new password",
    path: ["confirmPassword"],
  });

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;
type EmailData = z.infer<typeof emailSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const validateRegister = (data: RegisterData) => {
  return registerSchema.safeParse(data);
};

export const validateLogin = (data: LoginData) => {
  return loginSchema.safeParse(data);
};

export const validateEmail = (data: EmailData) => {
  return emailSchema.safeParse(data);
};

export const validateChangePassword = (data: ChangePasswordData) => {
  return changePasswordSchema.safeParse(data);
};

export const validateResetPassword = (data: ResetPasswordData) => {
  return resetPasswordSchema.safeParse(data);
};
