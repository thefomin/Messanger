import { z } from "zod"

export const MessageSchema = z.object({
	id: z.string(),
	senderId: z.number(),
	ciphertext: z.string(),
	encryptedKey: z.string(),
	parentMessageId: z.string().nullable().optional(),
	createdAt: z.string(),
	isEdited: z.boolean().optional(),
	chatId: z.string(),
})

export type MessageDto = z.infer<typeof MessageSchema>
