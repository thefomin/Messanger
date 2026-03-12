import { useCallback, useEffect } from "react"
import { useSession } from "@/shared/model"
import { useChatsSubscription } from "./use-chats-subscription"
import { MessageDto } from "./websocket.types"
import { useGetMessages } from "./uss-get-messages"
import { useGetChatUser } from "./use-get-chat-user"

export const useChatData = ({ recipientId }: { recipientId: number }) => {
	const { session } = useSession()
	console.log("recipientId chatdata " + recipientId)
	const {
		sendMessage: wsSendMessage,
		isConnected,
		chatId,
		setRecipient,
	} = useChatsSubscription({
		recipientId,
	})

	const { messages } = useGetMessages({
		chatId: chatId ?? "",
	})

	const { user } = useGetChatUser({ recipientId: recipientId.toString() ?? "" })
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

	useEffect(() => {
		setRecipient(Number(recipientId))
	}, [recipientId, setRecipient])
	return {
		messages,
		sendMessage,
		isConnected,
		isMyMessage,
		user,
	}
}
