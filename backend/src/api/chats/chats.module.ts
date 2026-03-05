import { FastifyInstance } from "fastify"
import { AuthMiddleware } from "@/shared/auth.middleware"
import { ChatService } from "./chats.service"
import { MessageService } from "./messages/messages.service"
import { ChatController } from "./chats.controller"
import { MessageController } from "./messages/messages.controller"
import { MessagesWebSocketService } from "./messages/messages-ws.service"
import { MessagesWebSocketController } from "./messages/messages-ws.controller"

export async function chatsModule(app: FastifyInstance) {
	const chatService = new ChatService()
	const messageService = new MessageService(chatService)
	const chatController = new ChatController(chatService)
	const messageController = new MessageController(messageService)
	const wsService = new MessagesWebSocketService(messageService)
	const wsController = new MessagesWebSocketController(wsService)
	app.get(
		"/chats",
		{ preHandler: AuthMiddleware.verify },
		chatController.getUserChats,
	)
	app.get(
		"/chats/:chatId/messages",
		{ preHandler: AuthMiddleware.verify },
		messageController.getChatMessages,
	)
	app.post(
		"/messages/direct",
		{ preHandler: AuthMiddleware.verify },
		messageController.sendMessage,
	)

	app.get(
		"/chats/:chatId/ws",
		{ websocket: true },
		wsController.registerWebSocketEndpoint(),
	)
}
