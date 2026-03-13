import { useQuery } from "@tanstack/react-query"
import { ChatUserDto } from "./chats.types"

export const useGetChatUser = ({ recipientId }: { recipientId: string }) => {
	const { data: user } = useQuery<ChatUserDto | null>({
		queryKey: ["chatUser", String(recipientId)],
		enabled: !!recipientId,
		queryFn: () => Promise.resolve(null), // ✅ теперь null, а не []
		gcTime: 1000 * 60 * 30,
		staleTime: Infinity,
	})

	return { user }
}
