import "react-router-dom"

export const ROUTES = {
	HOME: "/",
	PROFILE: "/:id",
	RECIPIENT_ID: "/:recipientId",
	REGISTER: "/auth/register",
	LOGIN: "/auth/login",
	RESET_PASSWORD: "/auth/reset-password",
	TERMS: "/terms",
	PRIVACY: "/privacy",
} as const

export type PathParams = {
	[ROUTES.PROFILE]: {
		id: number
	}
	[ROUTES.RECIPIENT_ID]: {
		recipientId: string
	}
}

declare module "react-router-dom" {
	interface Register {
		params: PathParams
	}
}
