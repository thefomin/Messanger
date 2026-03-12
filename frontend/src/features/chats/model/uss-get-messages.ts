import { useQuery } from "@tanstack/react-query"
import { MessageDto } from "./websocket.types"

export const useGetMessages = ({ chatId }: { chatId: string }) => {
	const { data: messages = [] } = useQuery<MessageDto[]>({
		queryKey: ["chatMessages", chatId],
		enabled: !!chatId,
		queryFn: () => Promise.resolve([]),
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	})

	return { messages }
}
