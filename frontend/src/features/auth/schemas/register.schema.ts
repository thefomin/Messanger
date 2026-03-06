import { z } from "zod"

export const RegisterSchema = z
	.object({
		email: z.string().email({
			message: "Некорректная почта",
		}),
		username: z.string().min(3, {
			message: "Имя пользователя минимум 3 символа",
		}),
		password: z.string().min(6, {
			message: "Пароль минимум 6 символов",
		}),
		passwordRepeat: z.string().min(6, {
			message: "Пароль подтверждения минимум 6 символов",
		}),
		agreement: z.boolean().refine((val) => val === true, {
			message: "Нужно согласиться с условиями",
		}),
	})
	.refine((data) => data.password === data.passwordRepeat, {
		message: "Пароли не совпадают",
		path: ["passwordRepeat"],
	})

export type TypeRegisterSchema = z.infer<typeof RegisterSchema>
