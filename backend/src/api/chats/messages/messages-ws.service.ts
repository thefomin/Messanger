import { MessageService } from "./messages.service"
import type { WebSocket } from "ws"

interface ChatConnectionsMap {
	[chatId: string]: Set<WebSocket>
}

export class MessagesWebSocketService {
	private chatConnections: ChatConnectionsMap = {}

	constructor(private readonly messageService: MessageService) {}

	public registerConnection(chatId: string, socket: WebSocket) {
		if (!this.chatConnections[chatId]) this.chatConnections[chatId] = new Set()
		this.chatConnections[chatId].add(socket)

		socket.on("close", () => {
			this.chatConnections[chatId].delete(socket)
			if (this.chatConnections[chatId].size === 0)
				delete this.chatConnections[chatId]
		})

		socket.on("message", async (raw) => {
			try {
				const data = JSON.parse(raw.toString())
				const senderId = data.senderId
				await this.handleMessage(chatId, senderId, data)
			} catch (err) {
				console.error("WS message error", err)
			}
		})
	}

	public async handleMessage(
		chatId: string,
		senderId: number,
		data: {
			ciphertext: string
			encryptedKey: string
			parentMessageId?: string
		},
	) {
		const message = await this.messageService.sendMessage({
			senderId,
			chatId,
			ciphertext: data.ciphertext,
			encryptedKey: data.encryptedKey,
			parentMessageId: data.parentMessageId,
		})

		const sockets = this.chatConnections[chatId]
		if (sockets) {
			const payload = {
				id: message.id,
				senderId: message.senderId,
				ciphertext: message.ciphertext,
				encryptedKey: message.encryptedKey,
				parentMessageId: message.parentMessageId,
				createdAt: message.createdAt,
			}
			for (const sock of sockets) sock.send(JSON.stringify(payload))
		}
	}
}
