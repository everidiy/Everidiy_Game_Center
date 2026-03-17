import { z } from "zod";

export const LogSchema = z.object({
    email: z.string().email("Некорректный email!"),
    password: z.string().min(8, "Минимум 8 символов!"),
});

export type LogFormData = z.infer<typeof LogSchema>;