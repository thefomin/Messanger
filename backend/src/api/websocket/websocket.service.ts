import { WebSocket } from "ws"
import { ChatsService } from "../chats/chats.service"
import { WebSocketEnum } from "@/shared/websocket-events"
import { MessagesService } from "../messages/messages.service"
import { UsersService } from "../users/users.service"

interface UserConnections {
	[userId: number]: Set<WebSocket>
}

interface ChatConnections {
	[chatId: string]: Set<WebSocket>
}

export class WebSocketService {
	private userConnections: UserConnections = {}
	private chatConnections: ChatConnections = {}

	constructor(
		private readonly messagesService: MessagesService,
		private readonly chatsService: ChatsService,
		private readonly usersService: UsersService,
	) {}

	// Добавление соединения после аутентификации
	public async addConnection(userId: number, socket: WebSocket) {
		if (!this.userConnections[userId]) {
			this.userConnections[userId] = new Set()
		}
		this.userConnections[userId].add(socket)

		// При закрытии удаляем соединение из всех структур
		socket.on("close", () => {
			this.removeConnection(userId, socket)
		})
	}

	private async removeConnection(userId: number, socket: WebSocket) {
		// Удаляем из userConnections
		this.userConnections[userId]?.delete(socket)
		if (this.userConnections[userId]?.size === 0) {
			delete this.userConnections[userId]
		}

		// Удаляем из всех подписок на чаты (можно хранить на сокете список чатов)
		if ((socket as any).subscribedChats) {
			for (const chatId of (socket as any).subscribedChats) {
				this.chatConnections[chatId]?.delete(socket)
				if (this.chatConnections[chatId]?.size === 0) {
					delete this.chatConnections[chatId]
				}
			}
		}
	}

	// Подписка на чат
	public async subscribeToChat(
		socket: WebSocket,
		userId: number,
		chatId: string,
	) {
		// Проверяем, является ли пользователь участником
		const chat = await this.chatsService.getChatById(chatId)
		if (!chat || !chat.participants.some((p) => p.userId === userId)) {
			throw new Error("Access denied")
		}

		if (!this.chatConnections[chatId]) {
			this.chatConnections[chatId] = new Set()
		}
		this.chatConnections[chatId].add(socket)

		// Запоминаем на сокете, на какие чаты подписан
		if (!(socket as any).subscribedChats) {
			;(socket as any).subscribedChats = new Set<string>()
		}
		;(socket as any).subscribedChats.add(chatId)
	}

	public unsubscribeFromChat(socket: WebSocket, chatId: string) {
		this.chatConnections[chatId]?.delete(socket)
		if (this.chatConnections[chatId]?.size === 0) {
			delete this.chatConnections[chatId]
		}
		;(socket as any).subscribedChats?.delete(chatId)
	}

	// Рассылка всем участникам чата
	public broadcastToChat(chatId: string, event: any) {
		const connections = this.chatConnections[chatId]
		if (!connections) return
		const message = JSON.stringify(event)
		for (const socket of connections) {
			socket.send(message)
		}
	}

	// Рассылка всем соединениям пользователя
	public broadcastToUser(userId: number, event: any) {
		const connections = this.userConnections[userId]
		if (!connections) return
		const message = JSON.stringify(event)
		for (const socket of connections) {
			socket.send(message)
		}
	}

	// ----- Обработчики событий -----
	async handleCreateOrGetChat(
		socket: WebSocket,
		userId: number,
		payload: any,
		requestId?: string,
	) {
		try {
			const { recipientId } = payload
			if (!recipientId) {
				throw new Error("recipientId required")
			}

			// Создаём или получаем чат
			const chat = await this.chatsService.getOrCreatePrivateChat(
				userId,
				recipientId,
			)

			// Отправляем результат клиенту
			socket.send(
				JSON.stringify({
					type: WebSocketEnum.CHAT_CREATED,
					requestId,
					payload: { chatId: chat.id },
				}),
			)

			// Можно также сразу подписать на этот чат, чтобы клиенту не делать дополнительный запрос
			await this.subscribeToChat(socket, userId, chat.id)

			// И отправить историю сообщений
			await this.handleGetChatHistory(
				socket,
				userId,
				{ chatId: chat.id },
				requestId,
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			this.sendError(socket, message, requestId)
		}
	}

	public async handleSendMessage(
		socket: WebSocket,
		userId: number,
		payload: any,
		requestId?: string,
	) {
		try {
			const { chatId, ciphertext, encryptedKey, parentMessageId } = payload
			if (!chatId || !ciphertext || !encryptedKey) {
				throw new Error("Missing required fields")
			}

			// Создаём сообщение
			const message = await this.messagesService.sendMessage({
				senderId: userId,
				chatId,
				ciphertext,
				encryptedKey,
				parentMessageId,
			})

			// Формируем событие для клиентов
			const messageEvent = {
				type: WebSocketEnum.MESSAGE_CREATED,
				requestId, // если был запрос, можно вернуть тот же requestId
				payload: {
					id: message.id,
					senderId: message.senderId,
					ciphertext: message.ciphertext,
					encryptedKey: message.encryptedKey,
					parentMessageId: message.parentMessageId,
					createdAt: message.createdAt,
					chatId,
				},
			}

			// Рассылаем всем подписанным на этот чат (включая отправителя)
			// this.broadcastToChat(chatId, messageEvent)

			// Инвалидация списка чатов для всех соединений участников чата
			// Для этого нужно получить всех участников чата
			const chat = await this.chatsService.getChatById(chatId)
			if (chat) {
				for (const participant of chat.participants) {
					this.broadcastToUser(participant.userId, messageEvent)
				}
			}
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleGetChats(
		socket: WebSocket,
		userId: number,
		requestId?: string,
	) {
		try {
			const chats = await this.chatsService.getUserChatsById(userId)
			socket.send(
				JSON.stringify({
					type: WebSocketEnum.CHATS_LIST,
					requestId,
					payload: { chats },
				}),
			)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleGetChatHistory(
		socket: WebSocket,
		userId: number,
		payload: any,
		requestId?: string,
	) {
		try {
			const { chatId } = payload
			if (!chatId) throw new Error("chatId required")

			// Проверяем доступ
			const chat = await this.chatsService.getChatById(chatId)
			if (!chat || !chat.participants.some((p) => p.userId === userId)) {
				throw new Error("Access denied")
			}

			const messages = await this.messagesService.getMessagesByChatId(chatId)
			socket.send(
				JSON.stringify({
					type: WebSocketEnum.CHAT_HISTORY,
					requestId,
					payload: { messages },
				}),
			)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleSearchUsers(
		socket: WebSocket,
		payload: any,
		requestId?: string,
	) {
		try {
			const { username, limit } = payload
			const users = await this.usersService.searchUsersByUsername(
				username,
				limit,
			)
			socket.send(
				JSON.stringify({
					type: WebSocketEnum.USERS_SEARCH_RESULT,
					requestId,
					payload: { users },
				}),
			)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleGetUserById(
		socket: WebSocket,
		payload: any,
		requestId?: string,
	) {
		try {
			const { userId } = payload
			if (!userId) throw new Error("userId required")

			const user = await this.usersService.getUserById(Number(userId))
			if (!user) throw new Error("User not found")

			socket.send(
				JSON.stringify({
					type: WebSocketEnum.GET_USER_BY_ID,
					requestId,
					payload: { user },
				}),
			)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleSubscribe(
		socket: WebSocket,
		userId: number,
		payload: any,
		requestId?: string,
	) {
		try {
			const { chatId } = payload
			if (!chatId) throw new Error("chatId required")
			await this.subscribeToChat(socket, userId, chatId)

			// Опционально сразу отправить историю
			await this.handleGetChatHistory(socket, userId, { chatId }, requestId)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	public async handleUnsubscribe(
		socket: WebSocket,
		payload: any,
		requestId?: string,
	) {
		try {
			const { chatId } = payload
			if (!chatId) throw new Error("chatId required")
			this.unsubscribeFromChat(socket, chatId)
			// Можно отправить подтверждение
			socket.send(
				JSON.stringify({
					type: "UNSUBSCRIBED",
					requestId,
					payload: { chatId },
				}),
			)
		} catch (error) {
			this.sendError(socket, this.getErrorMessage(error), requestId)
		}
	}

	private async sendError(
		socket: WebSocket,
		message: string,
		requestId?: string,
	) {
		socket.send(
			JSON.stringify({
				type: WebSocketEnum.ERROR,
				requestId,
				payload: { message },
			}),
		)
	}

	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error)
	}
}
