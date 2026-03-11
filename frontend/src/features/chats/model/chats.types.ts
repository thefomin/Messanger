export interface ChatParticipantDto {
	user: {
		id: number
		username: string
	}
}

export interface ChatUserDto {
	username: string
}

export interface ChatPreviewDto {
	id: string
	participants: ChatParticipantDto[]
	messages: {
		id: string
		ciphertext: string
		createdAt: string
		encryptedKey: string
	}[]
}

export interface ChatsListPayload {
	chats: ChatPreviewDto
}

export interface ChatUserDto {
	id: number
	username: string
}
