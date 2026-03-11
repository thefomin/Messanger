import { PrismaService } from "@/infra/prisma"

export class ChatsService {
	public async getOrCreatePrivateChat(user1: number, user2: number) {
		const [minId, maxId] = user1 < user2 ? [user1, user2] : [user2, user1]

		// Ищем чат, где ровно эти два участника
		const chat = await PrismaService.chat.findFirst({
			where: {
				AND: [
					{ participants: { some: { userId: minId } } },
					{ participants: { some: { userId: maxId } } },
				],
			},
			include: { participants: true },
		})

		if (chat) return chat

		// Создаём новый чат
		return PrismaService.chat.create({
			data: {
				participants: {
					create: [{ userId: minId }, { userId: maxId }],
				},
			},
			include: { participants: true },
		})
	}

	async getChatById(chatId: string) {
		return PrismaService.chat.findUnique({
			where: { id: chatId },
			include: { participants: true },
		})
	}

	public getChatsByUserId(userId: number) {
		return PrismaService.chatParticipant.findMany({
			where: { userId },
		})
	}

	async getUserChatsById(userId: number) {
		return PrismaService.chat.findMany({
			where: {
				participants: {
					some: {
						userId,
					},
				},
			},
			include: {
				participants: {
					where: {
						userId: {
							not: userId,
						},
					},
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				},
				messages: {
					orderBy: {
						createdAt: "desc",
					},
					select: {
						id: true,
						ciphertext: true,
						createdAt: true,
						encryptedKey: true,
					},
					take: 1,
				},
			},
		})
	}
}
