import { SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ApiSchemas } from "@/shared/api/schema"
import { useSession } from "@/shared/model"
import { ROUTES } from "@/shared/model/routes"
import { publicRqClient } from "@/shared/api/instance.api"

export function useSignin() {
	const navigate = useNavigate()

	const session = useSession()
	const signinMutation = publicRqClient.useMutation("post", "/auth/login", {
		onSuccess(data) {
			session.signin({})
			navigate(ROUTES.HOME)
		},
	})

	const signin = (data: ApiSchemas["LoginRequest"]) => {
		signinMutation.mutate({ body: data })
	}

	const errorMessage = signinMutation.isError
		? signinMutation.error.message
		: undefined

	return {
		signin,
		isPending: signinMutation.isPending,
		errorMessage,
	}
}
