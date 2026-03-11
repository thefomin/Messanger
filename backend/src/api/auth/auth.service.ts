import * as argon2 from "argon2"
import * as jwt from "jsonwebtoken"
import { env } from "@/config"
import { HttpStatus } from "@/shared/http-status"
import { SessionService } from "@/shared/session.service"
import { PrismaService } from "@/infra/prisma"

interface RefreshTokenPayload extends jwt.JwtPayload {
	sessionId: string
	userId: number
}

export class AuthService {
	public async findByLoginOrEmail(email: string, username: string) {
		const existingUser = await PrismaService.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
		})
		return existingUser
	}
	public async register(email: string, username: string, password: string) {
		if (!email || !username || !password) {
			throw new HttpStatus(400, "Email, username and password are required")
		}

		const hash = await argon2.hash(password)

		// создаём пользователя
		const user = await PrismaService.user.create({
			data: { email, username, password: hash },
		})

		// создаём сессию
		const { sessionId, refreshToken } = await SessionService.create(user.id)

		// создаём accessToken
		const accessToken = jwt.sign(
			{ userId: user.id, sessionId },
			env.JWT_SECRET,
			{ expiresIn: "15m" },
		)

		return { accessToken, refreshToken, user }
	}

	public async login(email: string, password: string) {
		const existingUser = await PrismaService.user.findUnique({
			where: { email },
		})
		if (!existingUser) throw new HttpStatus(401, "Invalid email or password")

		const valid = await argon2.verify(existingUser.password, password)
		if (!valid) throw new HttpStatus(401, "Invalid password")

		// создаём сессию
		const { sessionId, refreshToken } = await SessionService.create(
			existingUser.id,
		)

		// создаём accessToken
		const accessToken = jwt.sign(
			{ userId: existingUser.id, sessionId },
			env.JWT_SECRET,
			{ expiresIn: "15m" },
		)

		const user = await PrismaService.user.findUnique({
			where: { id: existingUser.id },
			select: { id: true, email: true, username: true, publicKey: true },
		})

		return { accessToken, refreshToken, user }
	}

	public async logout(sessionId: string) {
		await SessionService.delete(sessionId)
	}

	public async refresh(oldRefreshToken: string) {
		const session = await SessionService.getByRefreshToken(oldRefreshToken)
		console.log("session " + JSON.stringify(session))
		console.log("oldRefreshToken " + oldRefreshToken)
		if (!session) throw new HttpStatus(401, "Invalid session or refresh token")

		// новый accessToken
		const accessToken = jwt.sign(
			{ userId: session.userId, sessionId: session.sessionId },
			env.JWT_SECRET,
			{ expiresIn: "15m" },
		)

		// новый refreshToken (rotation)
		const refreshToken = await SessionService.rotate(session.sessionId)
		console.log("newRefreshToken " + refreshToken)
		return { accessToken, refreshToken }
	}
}
