import "react-router-dom"

export const ROUTES = {
	HOME: "/",
	PROFILE: "/:id",
	CHATS: "/chats",
	CHAT_ID: "/chats/:chat_id",
	REGISTER: "/auth/register",
	LOGIN: "/auth/login",
	TERMS: "/terms",
	PRIVACY: "/privacy",
} as const

export type PathParams = {
	[ROUTES.PROFILE]: {
		id: number
	}
	[ROUTES.CHAT_ID]: {
		chat_id: string
	}
}

declare module "react-router-dom" {
	interface Register {
		params: PathParams
	}
}
