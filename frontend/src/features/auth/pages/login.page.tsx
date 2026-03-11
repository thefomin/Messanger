import { Link } from "react-router-dom"
import { AuthLayout, LoginForm } from "../ui"
import { ROUTES } from "@/shared/model"

export function LoginPage() {
	return (
		<AuthLayout
			title="вход"
			form={<LoginForm />}
			description={
				<>
					<Link to={ROUTES.REGISTER} className="text-lg text-[#41A1E6]">
						или создать аккаунт
					</Link>
				</>
			}
			footer={
				<Link
					to={ROUTES.RESET_PASSWORD}
					className="text-foreground/50 w-full text-center"
				>
					забыли пароль?
				</Link>
			}
		/>
	)
}

export const Component = LoginPage
