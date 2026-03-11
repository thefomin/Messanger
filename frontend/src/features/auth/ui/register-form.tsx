import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"

import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
	Loading,
} from "@/shared/ui/kit"

import { AuthAgreement } from "./auth-agreement"
import { useRegister } from "../model/use-register"
import { RegisterSchema } from "../schemas"

export function RegisterForm() {
	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
	})

	const { errorMessage, isPending, register } = useRegister()

	const onSubmit = form.handleSubmit(register)

	return (
		<Form {...form}>
			<form className="flex flex-col gap-6" onSubmit={onSubmit}>
				<div className="flex flex-col gap-2">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										placeholder="username"
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 rounded-lg border-0 shadow-none placeholder:text-base placeholder:font-normal"
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										placeholder="email"
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 rounded-lg border-0 shadow-none placeholder:text-base placeholder:font-normal"
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										placeholder="пароль"
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 rounded-lg border-0 shadow-none placeholder:text-base placeholder:font-normal"
										type="password"
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="passwordRepeat"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="password"
										placeholder="подтвердите пароль"
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 rounded-lg border-0 shadow-none placeholder:text-base placeholder:font-normal"
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{errorMessage && (
					<p className="text-destructive text-sm">{errorMessage}</p>
				)}
				<div className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="agreement"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<AuthAgreement
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						disabled={isPending || !form.formState.isValid}
						type="submit"
						className="text-md bg-foreground text-background hover:bg-foreground disabled:bg-foreground/50 h-14 cursor-pointer font-medium disabled:cursor-not-allowed"
					>
						{isPending && <Loading />}
						<span>{isPending ? "" : "зарегистрироваться"}</span>
					</Button>
				</div>
			</form>
		</Form>
	)
}
