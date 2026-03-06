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

		return PrismaService.user.create({
			data: { email, username, password: hash },
		})
	}

	public async login(email: string, password: string) {
		const existingUser = await PrismaService.user.findUnique({
			where: { email },
		})
		if (!existingUser) throw new HttpStatus(401, "Invalid email or password")
		const valid = await argon2.verify(existingUser.password, password)
		if (!valid) throw new HttpStatus(401, "Invalid password")

		const sessionId = await SessionService.create(existingUser.id)
		const user = await PrismaService.user.findUnique({
			where: { id: existingUser.id },
			select: { id: true, email: true, username: true, publicKey: true },
		})
		const accessToken = jwt.sign(
			{ userId: existingUser.id, sessionId },
			env.JWT_SECRET,
			{ expiresIn: "15m" },
		)

		const refreshToken = jwt.sign(
			{ userId: user?.id, sessionId },
			env.JWT_REFRESH_SECRET,
			{ expiresIn: "7d" },
		)
		return { accessToken, refreshToken, user }
	}

	public async logout(sessionId: string) {
		await SessionService.delete(sessionId)
	}

	public async refresh(refreshToken: string) {
		const payload = jwt.verify(
			refreshToken,
			env.JWT_REFRESH_SECRET,
		) as RefreshTokenPayload

		const session = await SessionService.get(payload.sessionId)
		if (!session) {
			throw new HttpStatus(401, "Invalid session")
		}

		const accessToken = jwt.sign(
			{ userId: payload.userId, sessionId: payload.sessionId },
			env.JWT_SECRET,
			{ expiresIn: "15m" },
		)

		return { accessToken }
	}
}
