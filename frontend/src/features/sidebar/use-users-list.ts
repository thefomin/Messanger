import { useQuery } from "@tanstack/react-query"
import { ChatPreviewDto } from "../chats/model/chats.types"

export const useGetChatList = () => {
	const { data = [] } = useQuery<ChatPreviewDto[]>({
		queryKey: ["chats"],
		enabled: true,
		queryFn: () => Promise.resolve([]), // данные уже в кэше
		staleTime: Infinity,
	})

	const chats =
		data?.map((chat: ChatPreviewDto) => {
			const user = chat.participants?.[0]?.user
			const lastMessage = chat.messages?.[chat.messages.length - 1]

			return {
				id: chat.id,
				userId: user?.id,
				name: user?.username ?? "Unknown",
				avatar: null,
				avatarLetter: user?.username?.[0] ?? "U",
				avatarColor: "bg-purple-500",
				lastMessage: lastMessage?.ciphertext ?? "",
				time: lastMessage?.createdAt
					? new Date(lastMessage.createdAt).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})
					: "",
				unreadCount: 0,
			}
		}) ?? []

	return { chats }
}
