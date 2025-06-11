import { z } from "zod";

const updateProfileSchema = z.object({
  fullname: z
    .string()
    .min(6, { message: "Fullname must be at least 6 characters long" })
    .max(50, { message: "Fullname must be at most 50 characters long" })
    .optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const validateUpdateProfile = (data: UpdateProfileData) =>
  updateProfileSchema.safeParse(data);
