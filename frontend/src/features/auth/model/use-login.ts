import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ApiSchemas } from "@/shared/api/schema"
import { useSession } from "@/shared/model"
import { ROUTES } from "@/shared/model/routes"
import { publicRqClient } from "@/shared/api/instance.api"

export function useLogin() {
	const navigate = useNavigate()

	const session = useSession()
	const signinMutation = publicRqClient.useMutation("post", "/auth/login", {
		onSuccess(data) {
			if (data.accessToken) {
				session.login(data.accessToken)
				navigate(ROUTES.HOME)
			} else {
				toast.error("В ответе отсутствует токен доступа.")
			}
		},
	})

	const login = (data: ApiSchemas["LoginRequest"]) => {
		signinMutation.mutate({ body: data })
	}

	const errorMessage = signinMutation.isError
		? signinMutation.error.message
		: undefined

	return {
		login,
		isPending: signinMutation.isPending,
		errorMessage,
	}
}
