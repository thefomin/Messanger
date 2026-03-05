import { FastifyInstance } from "fastify"
import { authModule } from "@/api/auth/auth.module"
import { usersModule } from "./users/users.module"
import { chatsModule } from "./chats/chats.module"

export function ApiModule(app: FastifyInstance) {
	app.register(authModule, { prefix: "/api/v1/auth" })
	app.register(usersModule, { prefix: "/api/v1/users" })
	app.register(chatsModule, { prefix: "/api/v1/" })
	app.register(async (app) => {
		app.get("/health", async () => {
			return { status: "ok" }
		})
	})
}
