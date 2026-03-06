import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
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

import { useSignin } from "../model"
import { LoginSchema } from "../schemas"

export function SigninForm() {
	const [isShowTwoFactor, setIsShowFactor] = useState(false)
	const form = useForm({
		resolver: zodResolver(LoginSchema),
	})

	const { errorMessage, isPending, signin } = useSignin({ setIsShowFactor })

	const onSubmit = form.handleSubmit(signin)
	return (
		<Form {...form}>
			<form className="flex flex-col gap-2" onSubmit={onSubmit}>
				{!isShowTwoFactor && (
					<>
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
					</>
				)}

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
