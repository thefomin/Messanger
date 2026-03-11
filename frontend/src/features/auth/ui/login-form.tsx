import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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

import { LoginSchema } from "../schemas"
import { useLogin } from "../model/use-login"

export function LoginForm() {
	const form = useForm({
		resolver: zodResolver(LoginSchema),
	})

	const { errorMessage, isPending, login } = useLogin()

	const onSubmit = form.handleSubmit(login)
	return (
		<Form {...form}>
			<form className="flex flex-col gap-6" onSubmit={onSubmit}>
				<div className="flex flex-col gap-2">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 rounded-lg border-0 shadow-none placeholder:text-base placeholder:font-normal"
										placeholder="email"
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
										className="bg-foreground/7 placeholder:text-foreground/40 h-14 border-0 shadow-none placeholder:text-sm placeholder:font-normal"
										placeholder="пароль"
										type="password"
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

				<Button
					disabled={isPending || !form.formState.isValid}
					type="submit"
					className="bg-foreground text-background text-md hover:bg-foreground disabled:bg-foreground/50 h-14 cursor-pointer font-medium"
				>
					{isPending && <Loading />}
					<span>{isPending ? "" : "войти"}</span>
				</Button>
			</form>
		</Form>
	)
}
