import { WebSocket } from "ws"
import { WebSocketService } from "./websocket.service"
import { WebSocketEnum } from "@/shared/websocket-events"
import jwt from "jsonwebtoken"
import { env } from "@/config"

export class WebSocketController {
	constructor(private readonly wsService: WebSocketService) {}

	public registerWebSocketEndpoint() {
		return (connection: WebSocket) => {
			// Таймер на случай, если клиент не прислал AUTH
			const authTimeout = setTimeout(() => {
				connection.close(1008, "Authentication timeout")
			}, 10000) // 10 секунд

			// Обработчик первого (и только первого) сообщения
			const authHandler = async (raw: Buffer) => {
				try {
					const data = JSON.parse(raw.toString())

					// Проверяем, что это именно AUTH
					if (data.type !== WebSocketEnum.AUTH) {
						connection.send(
							JSON.stringify({
								type: WebSocketEnum.ERROR,
								payload: { message: "First message must be AUTH" },
							}),
						)
						connection.close()
						return
					}

					const { token } = data.payload
					if (!token) {
						connection.send(
							JSON.stringify({
								type: WebSocketEnum.ERROR,
								payload: { message: "Token required" },
							}),
						)
						connection.close()
						return
					}

					// Верифицируем JWT
					let userId: number
					try {
						const decoded = jwt.verify(token, env.JWT_SECRET) as {
							userId: number
						}
						userId = decoded.userId
					} catch {
						connection.send(
							JSON.stringify({
								type: WebSocketEnum.ERROR,
								payload: { message: "Invalid token" },
							}),
						)
						connection.close()
						return
					}

					// Успех – очищаем таймер и удаляем обработчик
					clearTimeout(authTimeout)
					connection.off("message", authHandler)

					// Регистрируем соединение
					this.wsService.addConnection(userId, connection)

					// Отправляем подтверждение
					connection.send(
						JSON.stringify({
							type: WebSocketEnum.CHAT_READY,
							payload: { userId },
						}),
					)

					// Устанавливаем основной обработчик для всех последующих сообщений
					connection.on("message", (raw: Buffer) =>
						this.handleMessage(connection, userId, raw),
					)
				} catch (err) {
					console.error("Auth error", err)
					connection.send(
						JSON.stringify({
							type: WebSocketEnum.ERROR,
							payload: { message: "Invalid message format" },
						}),
					)
					connection.close()
				}
			}

			connection.on("message", authHandler)
		}
	}

	private async handleMessage(
		connection: WebSocket,
		userId: number,
		raw: Buffer,
	) {
		try {
			const { type, payload, requestId } = JSON.parse(raw.toString())

			switch (type) {
				case WebSocketEnum.CREATE_OR_GET_CHAT:
					await this.wsService.handleCreateOrGetChat(
						connection,
						userId,
						payload,
						requestId,
					)
					break
				case WebSocketEnum.SEND_MESSAGE:
					await this.wsService.handleSendMessage(
						connection,
						userId,
						payload,
						requestId,
					)
					break
				case WebSocketEnum.GET_CHATS:
					await this.wsService.handleGetChats(connection, userId, requestId)
					break
				case WebSocketEnum.GET_CHAT_HISTORY:
					await this.wsService.handleGetChatHistory(
						connection,
						userId,
						payload,
						requestId,
					)
					break
				case WebSocketEnum.SEARCH_USERS:
					await this.wsService.handleSearchUsers(connection, payload, requestId)
					break
				case WebSocketEnum.SUBSCRIBE_TO_CHAT:
					await this.wsService.handleSubscribe(
						connection,
						userId,
						payload,
						requestId,
					)
					break
				case WebSocketEnum.UNSUBSCRIBE_FROM_CHAT:
					this.wsService.handleUnsubscribe(connection, payload, requestId)
					break
				default:
					connection.send(
						JSON.stringify({
							type: WebSocketEnum.ERROR,
							requestId,
							payload: { message: `Unknown event type: ${type}` },
						}),
					)
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err)
			connection.send(
				JSON.stringify({
					type: WebSocketEnum.ERROR,
					payload: { message: errorMessage },
				}),
			)
		}
	}
}
