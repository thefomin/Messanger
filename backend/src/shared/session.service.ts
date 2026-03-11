import { redis } from "@/infra/redis"
import { randomUUID } from "crypto"

export interface SessionData {
	userId: number
	refreshToken: string
}

export class SessionService {
	private static PREFIX = "session:"
	private static TTL = 60 * 60 * 24 * 7 // 7 дней

	/** Создаёт новую сессию с refreshToken */
	static async create(
		userId: number,
	): Promise<{ sessionId: string; refreshToken: string }> {
		const sessionId = randomUUID()
		const refreshToken = randomUUID()

		const session: SessionData = { userId, refreshToken }
		await redis.set(
			this.PREFIX + sessionId,
			JSON.stringify(session),
			"EX",
			this.TTL,
		)

		return { sessionId, refreshToken }
	}

	/** Получает сессию по sessionId */
	static async get(sessionId: string): Promise<SessionData | null> {
		const data = await redis.get(this.PREFIX + sessionId)
		if (!data) return null
		try {
			return JSON.parse(data) as SessionData
		} catch {
			return null
		}
	}

	/** Проверяет валидность refreshToken */
	static async validate(
		sessionId: string,
		refreshToken: string,
	): Promise<boolean> {
		const session = await this.get(sessionId)
		if (!session) return false
		return session.refreshToken === refreshToken
	}

	/** Обновляет refreshToken (rotation) */
	static async rotate(sessionId: string): Promise<string> {
		const session = await this.get(sessionId)
		if (!session) throw new Error("Session not found")

		const newRefreshToken = randomUUID()
		session.refreshToken = newRefreshToken

		await redis.set(
			this.PREFIX + sessionId,
			JSON.stringify(session),
			"EX",
			this.TTL,
		)
		return newRefreshToken
	}

	/** Удаляет сессию */
	static async delete(sessionId: string) {
		await redis.del(this.PREFIX + sessionId)
	}

	static async getByRefreshToken(
		refreshToken: string,
	): Promise<(SessionData & { sessionId: string }) | null> {
		const keys = await redis.keys(this.PREFIX + "*")
		for (const key of keys) {
			const data = await redis.get(key)
			if (!data) continue
			const session = JSON.parse(data) as SessionData
			if (session.refreshToken === refreshToken) {
				return { ...session, sessionId: key.replace(this.PREFIX, "") }
			}
		}
		return null
	}
}
