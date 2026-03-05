import { PrismaService } from "@/infra/prisma"
import { ChatService } from "../chats.service"

interface SendMessageDto {
	senderId: number
	chatId?: string
	recipientId?: number

	ciphertext: string
	encryptedKey: string

	parentMessageId?: string
}

export class MessageService {
	constructor(private readonly chatService: ChatService) {}

	public async sendMessage({
		senderId,
		chatId,
		recipientId,
		ciphertext,
		encryptedKey,
		parentMessageId,
	}: SendMessageDto) {
		let chat = null

		if (!chatId && recipientId) {
			chat = await this.chatService.findPrivateChat(senderId, recipientId)

			if (!chat) {
				chat = await this.chatService.createChat([senderId, recipientId])
			}

			chatId = chat.id
		}
		console.log("Saving message to DB:", {
			chatId,
			senderId,
			ciphertext,
			encryptedKey,
			parentMessageId,
		})
		return PrismaService.message.create({
			data: {
				chatId: chatId!,
				senderId,
				ciphertext,
				encryptedKey,
				parentMessageId: parentMessageId ?? null,
			},
		})
	}

	public async getChatMessages(chatId: string, limit = 50) {
		return PrismaService.message.findMany({
			where: { chatId },
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				sender: { select: { id: true, username: true } },
				replies: true,
			},
		})
	}
}
