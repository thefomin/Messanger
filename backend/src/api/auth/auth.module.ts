import { FastifyInstance } from "fastify"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { AuthMiddleware } from "@/shared/auth.middleware"

export async function authModule(app: FastifyInstance) {
	const authService = new AuthService()
	const controller = new AuthController(authService)

	app.post("/register", controller.register)
	app.post("/login", controller.login)

	app.post("/logout", { preHandler: AuthMiddleware.verify }, controller.logout)
}
