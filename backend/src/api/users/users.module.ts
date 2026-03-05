import { FastifyInstance } from "fastify"
import { AuthMiddleware } from "@/shared/auth.middleware"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"

export async function usersModule(app: FastifyInstance) {
	const usersService = new UsersService()
	const controller = new UsersController(usersService)

	app.get(
		"/by-username",
		{ preHandler: AuthMiddleware.verify },
		controller.getUserByUsername,
	)
	app.get(
		"/search",
		{ preHandler: AuthMiddleware.verify },
		controller.searchUsersByUsername,
	)
}
