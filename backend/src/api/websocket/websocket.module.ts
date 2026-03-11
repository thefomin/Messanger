import { FastifyInstance } from "fastify"
import { WebSocketController } from "./websocket.controller"
import { WebSocketService } from "./websocket.service"
import { UsersService } from "../users/users.service"
import { MessagesService } from "../messages/messages.service"
import { ChatsService } from "../chats/chats.service"

export async function WebSocketModule(app: FastifyInstance) {
	const chatsService = new ChatsService()
	const messagesService = new MessagesService(chatsService)
	const usersService = new UsersService()
	const webSockerService = new WebSocketService(
		messagesService,
		chatsService,
		usersService,
	)
	const webSockerController = new WebSocketController(webSockerService)
	app.get(
		"/ws",
		{ websocket: true },
		webSockerController.registerWebSocketEndpoint(),
	)
}
