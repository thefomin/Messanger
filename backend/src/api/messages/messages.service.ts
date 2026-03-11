// messages.service.ts
import { PrismaService } from "@/infra/prisma"
import { ChatsService } from "../chats/chats.service"

interface SendMessageDto {
	senderId: number
	chatId?: string
	recipientId?: number
	ciphertext: string
	encryptedKey: string
	parentMessageId?: string
}

export class MessagesService {
	constructor(private readonly chatsService: ChatsService) {}

	public async sendMessage(dto: SendMessageDto) {
		let chatId = dto.chatId

		// Если chatId не передан, ищем или создаём приватный чат
		if (!chatId && dto.recipientId) {
			const chat = await this.chatsService.getOrCreatePrivateChat(
				dto.senderId,
				dto.recipientId,
			)
			chatId = chat.id
		}

		const message = await PrismaService.message.create({
			data: {
				chatId: chatId!,
				senderId: dto.senderId,
				ciphertext: dto.ciphertext,
				encryptedKey: dto.encryptedKey,
				parentMessageId: dto.parentMessageId ?? null,
			},
		})

		return message
	}

	public async getMessagesByChatId(chatId: string) {
		return PrismaService.message.findMany({
			where: { chatId },
			orderBy: { createdAt: "asc" },
		})
	}
}
