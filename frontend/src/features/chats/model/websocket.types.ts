export enum WebSocketEventType {
	AUTH = "AUTH",
	CREATE_OR_GET_CHAT = "CREATE_OR_GET_CHAT",
	SEND_MESSAGE = "SEND_MESSAGE",
	GET_CHATS = "GET_CHATS",
	GET_CHAT_HISTORY = "GET_CHAT_HISTORY",
	SEARCH_USERS = "SEARCH_USERS",
	SUBSCRIBE_TO_CHAT = "SUBSCRIBE_TO_CHAT",
	UNSUBSCRIBE_FROM_CHAT = "UNSUBSCRIBE_FROM_CHAT",
	GET_USER_BY_ID = "GET_USER_BY_ID",
	USER_DATA = "USER_DATA",

	// Ответы сервера
	CHAT_READY = "CHAT_READY",
	MESSAGE_CREATED = "MESSAGE_CREATED",
	CHATS_LIST = "CHATS_LIST",
	CHAT_HISTORY = "CHAT_HISTORY",
	USERS_SEARCH_RESULT = "USERS_SEARCH_RESULT",
	INVALIDATE = "INVALIDATE",
	ERROR = "ERROR",
	CHAT_CREATED = "CHAT_CREATED",
}

export interface MessageDto {
	id: string
	senderId: number
	ciphertext: string
	encryptedKey: string
	parentMessageId?: string | null
	createdAt: string
	isEdited?: boolean
	chatId?: string
}

export interface ChatHistoryPayload {
	messages: ApiMessageDto[]
}

export interface ApiMessageDto {
	id?: string
	senderId?: number
	ciphertext?: string
	encryptedKey?: string
	parentMessageId?: string | null
	createdAt?: string
	isEdited?: boolean
	chatId?: string
}
