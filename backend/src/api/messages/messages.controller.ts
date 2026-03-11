import { ChatsService } from "../chats/chats.service"
import { MessagesService } from "./messages.service"
import { FastifyReply, FastifyRequest } from "fastify"

export class MessageController {
	constructor(
		private readonly messagesService: MessagesService,
		private readonly chatsService: ChatsService,
	) {}

	public getMessagesHandler() {
		return async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				const { chatId } = req.params as { chatId: string }
				const userId = (req as any).user.userId // из auth middleware

				if (!chatId) return reply.status(400).send({ error: "chatId required" })

				// Проверяем, что пользователь является участником чата
				const chat = await this.chatsService.getChatById(chatId)
				if (!chat || !chat.participants.some((p) => p.userId === userId)) {
					return reply.status(403).send({ error: "Access denied" })
				}

				const messages = await this.messagesService.getMessagesByChatId(chatId)
				return reply.send(messages)
			} catch (err) {
				console.error(err)
				return reply.status(500).send({ error: "Failed to fetch messages" })
			}
		}
	}
}
