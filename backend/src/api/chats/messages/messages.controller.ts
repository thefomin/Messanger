import { FastifyRequest, FastifyReply } from "fastify"
import { MessageService } from "./messages.service"

type AuthRequest<Body = any, Params = any> = FastifyRequest<{
	Body: Body
	Params: Params
	User: { userId: string }
}>

export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	public sendMessage = async (
		req: AuthRequest<{
			recipientId?: number
			chatId?: string
			ciphertext: string
			encryptedKey: string
			parentMessageId?: string
		}>,
		reply: FastifyReply,
	) => {
		const senderId = (req as any).user.userId
		const { recipientId, chatId, ciphertext, encryptedKey, parentMessageId } =
			req.body
		const message = await this.messageService.sendMessage({
			senderId,
			chatId,
			recipientId,
			ciphertext,
			encryptedKey,
			parentMessageId,
		})
		reply.send(message)
	}

	public getChatMessages = async (
		req: AuthRequest<{}, { chatId: string }>,
		reply: FastifyReply,
	) => {
		const chatId = req.params.chatId
		const messages = await this.messageService.getChatMessages(chatId)
		reply.send(messages)
	}
}
