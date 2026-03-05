import { FastifyRequest } from "fastify"
import jwt from "jsonwebtoken"
import { env } from "@/config"
import { MessagesWebSocketService } from "./messages-ws.service"
import type { WebSocket } from "@fastify/websocket"

interface ChatWsParams {
	chatId: string
}

export class MessagesWebSocketController {
	constructor(private readonly wsService: MessagesWebSocketService) {}

	public registerWebSocketEndpoint() {
		return async (
			connection: WebSocket,
			req: FastifyRequest<{ Params: ChatWsParams }>,
		) => {
			const chatId = req.params.chatId

			const token =
				req.headers.authorization?.split(" ")[1] || (req.query as any).token
			if (!token) {
				connection.send(JSON.stringify({ error: "Missing token" }))
				connection.close()
				return
			}

			let userId: number
			try {
				const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number }
				userId = decoded.userId
			} catch {
				connection.send(JSON.stringify({ error: "Invalid token" }))
				connection.close()
				return
			}

			this.wsService.registerConnection(chatId, connection)
		}
	}
}
