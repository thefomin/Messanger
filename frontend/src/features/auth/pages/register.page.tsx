import { ROUTES } from "@/shared/model"
import { Link } from "react-router-dom"
import { AuthLayout, RegisterForm } from "../ui"

export function RegisterPage() {
	return (
		<AuthLayout
			title="регистрация"
			description={
				<>
					<Link to={ROUTES.LOGIN} className="text-lg text-[#41A1E6]">
						или войти в аккаунт
					</Link>
				</>
			}
			form={<RegisterForm />}
		/>
	)
}

export const Component = RegisterPage
