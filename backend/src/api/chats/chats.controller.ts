import { FastifyRequest, FastifyReply } from "fastify"
import { ChatService } from "./chats.service"

type AuthRequest<Params = any> = FastifyRequest<{
	Params: Params
	User: { userId: string }
}>

export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	public getUserChats = async (req: AuthRequest, reply: FastifyReply) => {
		const userId = (req as any).user.userId
		const chats = await this.chatService.getUserChats(userId)
		reply.send(chats)
	}
}
