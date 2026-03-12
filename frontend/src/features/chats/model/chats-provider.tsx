import { WebSocketProvider } from "@/features/websocket/webscoket-provider"
import { useSession } from "@/shared/model"

export const ChatsProvider = ({ children }: { children: React.ReactNode }) => {
	const { token } = useSession()
	return (
		<WebSocketProvider url="ws://localhost:3000/api/v1/ws" authToken={token!}>
			{children}
		</WebSocketProvider>
	)
}
