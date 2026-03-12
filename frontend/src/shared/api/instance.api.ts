import createFetchClient from "openapi-fetch"
import createClient from "openapi-react-query"
import { CONFIG } from "@/shared/model/config"
import { ApiPaths, ApiSchemas } from "./schema"
import { useSession } from "../model/session"

export const fetchClient = createFetchClient<ApiPaths>({
	baseUrl: CONFIG.API_BASE_URL,
	credentials: "include",
})
export const rqClient = createClient(fetchClient)

export const publicFetchClient = createFetchClient<ApiPaths>({
	baseUrl: CONFIG.API_BASE_URL,
	credentials: "include",
})
export const publicRqClient = createClient(publicFetchClient)

fetchClient.use({
	async onRequest({ request }) {
		const token = await useSession.getState().token

		if (token) {
			request.headers.set("Authorization", `Bearer ${token}`)
		} else {
			return new Response(
				JSON.stringify({
					code: "NOT_AUTHOIZED",
					message: "You are not authorized to access this resource",
				} as ApiSchemas["Error"]),
				{
					status: 401,
					headers: {
						"Content-Type": "application/json",
					},
				},
			)
		}
	},
})
