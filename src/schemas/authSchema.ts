import { z } from "zod";

export const AuthSchema = z.object({
    email: z.string()
    .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Некорректный email!"
    ),
    password: 
    z.string()
    .min(8, "Минимум 8 символов!")
    .regex(/[A-Z]/, "Нужна заглавная буква!")
    .regex(/[0-9]/, "Нужна цифра!"),
    confirmPassword: z.string().min(8, "Повторите пароль!"),
    agreement: z.boolean().refine(val => val === true, {
        message: "Необходимо ваше согласие!",
    }),
}).refine((data) => data.confirmPassword === data.password, {
    message: "Пароли не совпадают!",
    path: ["confirmPassword"],
});

export type AuthFormData = z.infer<typeof AuthSchema>;