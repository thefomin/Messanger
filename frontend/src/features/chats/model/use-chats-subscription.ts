import { useEffect, useRef, useCallback } from "react"
import { useSession } from "@/shared/model"
import { queryClient } from "@/shared/api"
import {
	ApiMessageDto,
	ChatHistoryPayload,
	MessageDto,
	WebSocketEventType,
} from "./websocket.types"
import { ChatPreviewDto, ChatsListPayload, ChatUserDto } from "./chats.types"

interface WebSocketEvent {
	type: WebSocketEventType
	requestId?: string
	payload: any
}

const toMessageDto = (data: ApiMessageDto): MessageDto | null => {
	if (
		!data.id ||
		!data.senderId ||
		!data.ciphertext ||
		!data.encryptedKey ||
		!data.createdAt
	) {
		console.warn("Invalid message data:", data)
		return null
	}

	return {
		id: data.id,
		senderId: data.senderId,
		ciphertext: data.ciphertext,
		encryptedKey: data.encryptedKey,
		parentMessageId: data.parentMessageId,
		createdAt: data.createdAt,
		isEdited: data.isEdited,
		chatId: data.chatId,
	}
}

const updateChatPreview = (chatId: string, newMessage: MessageDto) => {
	console.log(`🔄 Updating chat preview for chat ${chatId}`, newMessage)
	queryClient.setQueryData<ChatPreviewDto[]>(["chats"], (old = []) => {
		console.log("Old chats:", old)
		const updated = old.map((chat) => {
			if (chat.id !== chatId) return chat
			return {
				...chat,
				messages: [
					{
						id: newMessage.id,
						ciphertext: newMessage.ciphertext,
						createdAt: newMessage.createdAt,
						encryptedKey: newMessage.encryptedKey,
					},
				],
			}
		})
		console.log("New chats:", updated)
		return updated
	})
}

export const useChatsSubscription = ({
	recipientId,
	onChatReady,
	onSearchResult,
}: {
	recipientId?: number
	onChatReady?: (chatId: string) => void
	onSearchResult?: (users: ChatUserDto[]) => void
}) => {
	const { token } = useSession()
	const ws = useRef<WebSocket | null>(null)
	const chatIdRef = useRef<string | null>(null)
	const requestIdCounter = useRef(0)

	const nextRequestId = useCallback(() => {
		requestIdCounter.current += 1
		return `req_${requestIdCounter.current}`
	}, [])

	useEffect(() => {
		if (!token) return

		ws.current = new WebSocket("ws://localhost:3000/api/v1/ws")

		ws.current.onopen = () => {
			console.log("🔌 WebSocket connected")
			ws.current?.send(
				JSON.stringify({
					type: WebSocketEventType.AUTH,
					payload: { token },
				}),
			)
		}

		ws.current.onmessage = (event) => {
			try {
				const { type, payload, requestId }: WebSocketEvent = JSON.parse(
					event.data,
				)
				console.log("📩 WS event:", type, payload, requestId)

				switch (type) {
					case WebSocketEventType.CHAT_READY: {
						console.log("✅ Authenticated, userId:", payload.userId)

						// 1. Запрос списка чатов
						ws.current?.send(
							JSON.stringify({
								type: WebSocketEventType.GET_CHATS,
								requestId: nextRequestId(),
								payload: {},
							}),
						)
						if (recipientId) {
							const createChatReqId = nextRequestId()
							ws.current?.send(
								JSON.stringify({
									type: WebSocketEventType.CREATE_OR_GET_CHAT,
									requestId: createChatReqId,
									payload: { recipientId },
								}),
							)
						}
						break
					}

					case WebSocketEventType.CHAT_CREATED: {
						const chatId = payload.chatId
						chatIdRef.current = chatId
						console.log("💬 Chat created/retrieved:", chatId)
						onChatReady?.(chatId)

						if (recipientId) {
							ws.current?.send(
								JSON.stringify({
									type: WebSocketEventType.GET_USER_BY_ID, // было SEARCH_USERS
									requestId: nextRequestId(),
									payload: { userId: recipientId }, // только userId, limit не нужен
								}),
							)
						}
						break
					}

					case WebSocketEventType.CHAT_HISTORY: {
						const historyPayload = payload as ChatHistoryPayload
						console.log("📜 Received chat history:", payload.messages)
						const chatId = chatIdRef.current
						if (!chatId) break

						const messages = historyPayload.messages
							.map(toMessageDto)
							.filter((msg): msg is MessageDto => msg !== null)

						queryClient.setQueryData(["chatMessages", chatId], messages)
						break
					}

					case WebSocketEventType.CHATS_LIST: {
						const chatsPayload = payload as ChatsListPayload
						console.log("📜 Received chats list:", chatsPayload.chats)
						queryClient.setQueryData(["chats"], chatsPayload.chats)

						break
					}

					case WebSocketEventType.MESSAGE_CREATED: {
						console.log("📝 Processing MESSAGE_CREATED:", payload)
						const newMessage = toMessageDto(payload)
						if (!newMessage) {
							console.warn("❌ Failed to convert message")
							break
						}

						// Определяем chatId из сообщения или из рефа
						const chatId = payload.chatId || chatIdRef.current
						if (!chatId) {
							console.warn("❌ No chatId available for MESSAGE_CREATED")
							break
						}

						// Обновляем кэш сообщений для этого чата
						queryClient.setQueryData<MessageDto[]>(
							["chatMessages", chatId],
							(old = []) => {
								if (old.some((msg) => msg.id === newMessage.id)) {
									return old // уже есть, не добавляем
								}
								return [...old, newMessage]
							},
						)

						updateChatPreview(chatId, newMessage)
						// Инвалидируем список чатов, так как последнее сообщение изменилось
						// queryClient.invalidateQueries({queryKey:['chatMessages']})
						break
					}

					case WebSocketEventType.USERS_SEARCH_RESULT: {
						const users = payload.users as ChatUserDto[]
						console.log("🔍 Search results:", users)
						onSearchResult?.(users)
						break
					}

					case WebSocketEventType.GET_USER_BY_ID: {
						const user = payload.user as ChatUserDto
						if (user) {
							queryClient.setQueryData(["chatUser", Number(user.id)], user)
							console.log("👤 User saved to cache via USER_DATA:", user)
						}
						break
					}
					case WebSocketEventType.INVALIDATE: {
						// Инвалидация кэша по сущностям
						if (payload.entity.includes("chats")) {
							// queryClient.invalidateQueries({ queryKey: ["chats"] })
						}
						if (payload.entity.includes("messages") && chatIdRef.current) {
							// queryClient.invalidateQueries({
							// 	queryKey: ["chatMessages", chatIdRef.current],
							// })
						}
						break
					}

					case WebSocketEventType.ERROR: {
						console.error("❌ WS error:", payload.message)
						// Можно показать уведомление пользователю
						break
					}

					default:
						console.log("Unhandled event type:", type)
				}
			} catch (err) {
				console.error("❌ WS message error:", err)
			}
		}

		ws.current.onclose = (event) => {
			console.log("🔌 WebSocket disconnected:", event.code, event.reason)
		}

		ws.current.onerror = (error) => {
			console.error("🔌 WebSocket error:", error)
		}

		return () => {
			ws.current?.close()
		}
	}, [token, recipientId, onChatReady, nextRequestId])

	const sendMessage = useCallback(
		(
			ciphertext: string,
			encryptedKey: string,
			parentMessageId?: string | null,
		) => {
			if (!ws.current || !chatIdRef.current) {
				console.error("WebSocket not ready or chatId missing")
				return
			}

			ws.current.send(
				JSON.stringify({
					type: WebSocketEventType.SEND_MESSAGE,
					requestId: nextRequestId(),
					payload: {
						chatId: chatIdRef.current,
						ciphertext,
						encryptedKey,
						parentMessageId: parentMessageId ?? null,
					},
				}),
			)
		},
		[nextRequestId],
	)

	const send = useCallback(
		(type: WebSocketEventType, payload: any, requestId?: string) => {
			if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
				console.error("WebSocket not ready")
				return
			}
			ws.current.send(
				JSON.stringify({
					type,
					requestId: requestId ?? nextRequestId(),
					payload,
				}),
			)
		},
		[nextRequestId],
	)

	return {
		sendMessage,
		send,
		isConnected: ws.current?.readyState === WebSocket.OPEN,
		chatId: chatIdRef.current,
	}
}
