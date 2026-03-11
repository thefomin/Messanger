import { FastifyInstance } from "fastify"
import { AuthModule } from "@/api/auth/auth.module"
import { WebSocketModule } from "./websocket/websocket.module"

export function ApiModule(app: FastifyInstance) {
	app.register(AuthModule, { prefix: "/api/v1/auth" })
	app.register(WebSocketModule, { prefix: "/api/v1/" })
	app.register(async (app) => {
		app.get("/health", async () => {
			return { status: "ok" }
		})
	})
}
