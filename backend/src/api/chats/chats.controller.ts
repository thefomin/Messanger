import { ChatsService } from "./chats.service"
import { FastifyReply, FastifyRequest } from "fastify"

export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	public async getChatsByUserId(req: FastifyRequest, reply: FastifyReply) {
		const userId = (req as any).user.userId
		const chats = await this.chatsService.getUserChatsById(userId)
		reply.send(chats)
	}
}
