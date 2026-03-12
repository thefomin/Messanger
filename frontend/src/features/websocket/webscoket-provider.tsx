import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
	ReactNode,
} from "react"
import { WebSocketEventType } from "../chats/model/websocket.types"

interface WebSocketMessage {
	type: string
	payload: unknown
	timestamp: string
}

interface WebSocketContextValue {
	isConnected: boolean
	connectionState: "connecting" | "connected" | "disconnected" | "error"
	sendMessage: (type: string, payload: unknown) => void
	subscribe: (type: string, handler: (payload: unknown) => void) => () => void
	lastError: Error | null
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
	url: string
	children: ReactNode
	authToken?: string
}

export function WebSocketProvider({
	url,
	children,
	authToken,
}: WebSocketProviderProps): React.ReactElement {
	const [isConnected, setIsConnected] = useState<boolean>(false)
	const [connectionState, setConnectionState] = useState<
		"connecting" | "connected" | "disconnected" | "error"
	>("disconnected")
	const [lastError, setLastError] = useState<Error | null>(null)

	const socketRef = useRef<WebSocket | null>(null)
	const subscribersRef = useRef<Map<string, Set<(payload: unknown) => void>>>(
		new Map(),
	)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Subscribe to specific message types
	const subscribe = useCallback(
		(type: string, handler: (payload: unknown) => void) => {
			if (!subscribersRef.current.has(type)) {
				subscribersRef.current.set(type, new Set())
			}
			subscribersRef.current.get(type)!.add(handler)

			// Return unsubscribe function
			return () => {
				subscribersRef.current.get(type)?.delete(handler)
			}
		},
		[],
	)

	// Dispatch message to subscribers
	const dispatch = useCallback((message: WebSocketMessage) => {
		const handlers = subscribersRef.current.get(message.type)
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler(message.payload)
				} catch (error) {
					console.error("Error in message handler:", error)
				}
			})
		}

		const wildcardHandlers = subscribersRef.current.get("*")
		if (wildcardHandlers) {
			wildcardHandlers.forEach((handler) => {
				try {
					handler(message)
				} catch (error) {
					console.error("Error in wildcard handler:", error)
				}
			})
		}
	}, [])

	const sendMessage = useCallback((type: string, payload: unknown) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			const message: WebSocketMessage = {
				type,
				payload,
				timestamp: new Date().toISOString(),
			}
			socketRef.current.send(JSON.stringify(message))
		} else {
			console.warn("WebSocket not connected, message not sent")
		}
	}, [])

	const connect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
		}

		setConnectionState("connecting")

		const ws = new WebSocket(url)

		ws.onopen = () => {
			console.log("WebSocket connected")
			ws.send(
				JSON.stringify({
					type: WebSocketEventType.AUTH,
					payload: { token: authToken },
				}),
			)

			setIsConnected(true)
			setConnectionState("connected")
			setLastError(null)
		}

		ws.onmessage = (event: MessageEvent) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data)
				dispatch(message)
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error)
			}
		}

		ws.onclose = (event: CloseEvent) => {
			console.log("WebSocket closed:", event.code)
			setIsConnected(false)
			setConnectionState("disconnected")

			if (event.code !== 1000) {
				reconnectTimeoutRef.current = setTimeout(connect, 5000)
			}
		}

		ws.onerror = () => {
			setConnectionState("error")
			setLastError(new Error("WebSocket connection failed"))
		}

		socketRef.current = ws
	}, [url, authToken, dispatch])

	useEffect(() => {
		connect()

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}
			socketRef.current?.close(1000, "Component unmounted")
		}
	}, [connect])

	const value: WebSocketContextValue = {
		isConnected,
		connectionState,
		sendMessage,
		subscribe,
		lastError,
	}

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	)
}

export function useWebSocketContext(): WebSocketContextValue {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error(
			"useWebSocketContext must be used within a WebSocketProvider",
		)
	}
	return context
}

export function useWebSocketSubscription(
	type: string,
	handler: (payload: unknown) => void,
): void {
	const { subscribe } = useWebSocketContext()

	useEffect(() => {
		const unsubscribe = subscribe(type, handler)
		return unsubscribe
	}, [type, handler, subscribe])
}
