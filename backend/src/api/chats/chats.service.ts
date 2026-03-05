import { PrismaService } from "@/infra/prisma"

export class ChatService {
	/**
	 * Находит приватный чат между двумя пользователями
	 */
	public async findPrivateChat(userA: number, userB: number) {
		return PrismaService.chat.findFirst({
			where: {
				participants: {
					every: { userId: { in: [userA, userB] } },
				},
			},
			include: { participants: true },
		})
	}

	/**
	 * Создаёт чат с указанными участниками
	 */
	public async createChat(userIds: number[]) {
		return PrismaService.chat.create({
			data: {
				participants: {
					create: userIds.map((id) => ({ userId: id })),
				},
			},
			include: { participants: true },
		})
	}

	/**
	 * Получение чатов пользователя
	 */
	async getUserChats(userId: number) {
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
					take: 1,
				},
			},
		})
	}
}
