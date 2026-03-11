import { useQuery } from "@tanstack/react-query"
import { ChatUserDto } from "./chats.types"

export const useGetChatUser = (recipientId: string) => {
	const { data: user } = useQuery<ChatUserDto | undefined>({
		queryKey: ["chatUser", Number(recipientId)],
		enabled: !!recipientId,
		queryFn: () => Promise.resolve(undefined), // заглушка — данные уже в кэше
		gcTime: Infinity, // не удаляем из кэша (опционально)
	})

	return { user }
}
