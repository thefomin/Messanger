import { useRef, useCallback, useState } from "react"
import { queryClient } from "@/shared/api"
import {
	ChatHistoryPayload,
	MessageDto,
	WebSocketEventType,
} from "./websocket.types"
import { ChatPreviewDto, ChatUserDto } from "./chats.types"
import { MessageSchema } from "../schemas/message.schema"
import {
	useWebSocketContext,
	useWebSocketSubscription,
} from "@/features/websocket/webscoket-provider"

export const useChatsSubscription = ({
	recipientId,
	onSearchResult,
}: {
	recipientId?: number
	onSearchResult?: (users: ChatUserDto[]) => void
}) => {
	const { sendMessage, isConnected } = useWebSocketContext()
	const [chatIdState, setChatIdState] = useState<string | null>(null)
	const chatIdRef = useRef<string | null>(null)
	const recipientIdRef = useRef<number | null>(recipientId ?? null)
	const handleChatReady = useCallback(
		(payload: any) => {
			console.log("✅ Authenticated, userId:", payload.userId)
			sendMessage(WebSocketEventType.GET_CHATS, {})

			if (recipientId) {
				sendMessage(WebSocketEventType.CREATE_OR_GET_CHAT, { recipientId })
			}
		},
		[recipientId, sendMessage],
	)
	useWebSocketSubscription(WebSocketEventType.CHAT_READY, handleChatReady)

	const handleChatCreated = useCallback(
		(payload: any) => {
			chatIdRef.current = payload.chatId
			console.log("💬 Chat created:", payload.chatId)
			setChatIdState(payload.chatId)
			if (recipientId) {
				sendMessage(WebSocketEventType.GET_USER_BY_ID, { userId: recipientId })
			}

			sendMessage(WebSocketEventType.GET_CHAT_HISTORY, {
				chatId: payload.chatId,
			})
		},
		[recipientId, sendMessage],
	)
	useWebSocketSubscription(WebSocketEventType.CHAT_CREATED, handleChatCreated)

	const handleChatsList = useCallback((payload: any) => {
		queryClient.setQueryData(["chats"], payload.chats as ChatPreviewDto[])
	}, [])
	useWebSocketSubscription(WebSocketEventType.CHATS_LIST, handleChatsList)

	const handleChatHistory = useCallback((payload: any) => {
		const historyMessage = payload as ChatHistoryPayload
		const messages = historyMessage.messages
			.map((m) => MessageSchema.safeParse(m))
			.filter((r) => r.success)
			.map((r) => r.data)

		if (!chatIdRef.current) return
		queryClient.setQueryData(["chatMessages", chatIdRef.current], messages)
	}, [])
	useWebSocketSubscription(WebSocketEventType.CHAT_HISTORY, handleChatHistory)

	const handleMessageCreated = useCallback((payload: any) => {
		const parsed = MessageSchema.safeParse(payload)
		if (!parsed.success) return

		const newMessage = parsed.data
		const targetChatId = payload.chatId || chatIdRef.current
		if (!targetChatId) return

		queryClient.setQueryData<MessageDto[]>(
			["chatMessages", targetChatId],
			(old = []) => {
				if (old.some((m) => m.id === newMessage.id)) return old
				return [...old, newMessage]
			},
		)

		queryClient.setQueryData<ChatPreviewDto[]>(["chats"], (old = []) =>
			old.map((chat) =>
				chat.id === targetChatId
					? {
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
					: chat,
			),
		)
	}, [])
	useWebSocketSubscription(
		WebSocketEventType.MESSAGE_CREATED,
		handleMessageCreated,
	)

	const handleSearchResult = useCallback(
		(payload: any) => onSearchResult?.(payload.users),
		[onSearchResult],
	)
	useWebSocketSubscription(
		WebSocketEventType.USERS_SEARCH_RESULT,
		handleSearchResult,
	)

	const handleUserById = useCallback((payload: any) => {
		const user = payload.user as ChatUserDto
		if (!user) return
		queryClient.setQueryData(["chatUser", String(user.id)], user)
	}, [])
	useWebSocketSubscription(WebSocketEventType.GET_USER_BY_ID, handleUserById)

	const handleError = useCallback((payload: any) => {
		console.error("❌ WS error:", payload.message)
	}, [])
	useWebSocketSubscription(WebSocketEventType.ERROR, handleError)

	const sendChatMessage = useCallback(
		(
			ciphertext: string,
			encryptedKey: string,
			parentMessageId?: string | null,
		) => {
			if (!chatIdRef.current) return
			sendMessage(WebSocketEventType.SEND_MESSAGE, {
				chatId: chatIdRef.current,
				ciphertext,
				encryptedKey,
				parentMessageId: parentMessageId ?? null,
			})
		},
		[sendMessage],
	)

	const send = useCallback(
		(event: string, payload?: any) => {
			sendMessage(event as WebSocketEventType, payload)
		},
		[sendMessage],
	)

	const setRecipient = useCallback(
		(newRecipientId: number) => {
			chatIdRef.current = null
			setChatIdState(null)
			recipientIdRef.current = newRecipientId
			sendMessage(WebSocketEventType.CREATE_OR_GET_CHAT, {
				recipientId: newRecipientId,
			})
		},
		[sendMessage],
	)

	return {
		sendMessage: sendChatMessage,
		send,
		setRecipient,
		isConnected,
		chatId: chatIdState,
	}
}
