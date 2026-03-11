import { useState, useCallback } from "react"
import { useSession } from "@/shared/model"
import { useChatsSubscription } from "./use-chats-subscription"
import { MessageDto } from "./websocket.types"
import { useGetMessages } from "./uss-get-messages"

export const useChatData = ({ recipientId }: { recipientId: number }) => {
	const [chatId, setChatId] = useState<string | null>(null)
	const { session } = useSession()

	const { sendMessage: wsSendMessage, isConnected } = useChatsSubscription({
		recipientId,
		onChatReady: setChatId,
	})

	const { messages } = useGetMessages({ chatId: chatId! })

	const sendMessage = useCallback(
		(
			ciphertext: string,
			encryptedKey: string,
			parentMessageId?: string | null,
		) => {
			wsSendMessage(ciphertext, encryptedKey, parentMessageId)
		},
		[wsSendMessage],
	)

	// Определяем, моё ли сообщение
	const isMyMessage = useCallback(
		(message: MessageDto) => {
			return message.senderId === session?.userId
		},
		[session?.userId],
	)

	return {
		messages,
		sendMessage,
		isConnected,
		chatId,
		isMyMessage,
	}
}
