import { FastifyReply, FastifyRequest } from "fastify"
import { AuthService } from "./auth.service"
import { LoginDto, RegisterDto } from "./auth.dto"

export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	public register = async (
		req: FastifyRequest<{ Body: RegisterDto }>,
		reply: FastifyReply,
	) => {
		const { email, username, password } = req.body

		if (!email || !username || !password) {
			reply
				.status(400)
				.send({ error: "Email, username and password are required" })
			return
		}

		const { accessToken, refreshToken, user } = await this.authService.register(
			email,
			username,
			password,
		)

		// ставим refreshToken в HTTP-only cookie
		reply.setCookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 дней
		})

		// возвращаем accessToken и данные пользователя
		reply.send({ accessToken, user })
	}

	public login = async (
		req: FastifyRequest<{ Body: LoginDto }>,
		reply: FastifyReply,
	) => {
		const { email, password } = req.body
		if (!email || !password) {
			reply.status(400).send({ error: "Email and password are required" })
			return
		}

		const { accessToken, refreshToken, user } = await this.authService.login(
			email,
			password,
		)

		// ставим refreshToken в HTTP-only cookie
		reply.setCookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 дней
		})

		reply.send({ accessToken, user })
	}

	public logout = async (req: any, reply: FastifyReply) => {
		await this.authService.logout(req.user.sessionId)
		reply.send({ ok: true })
	}

	public refresh = async (req: FastifyRequest, reply: FastifyReply) => {
		const oldRefreshToken = req.cookies?.refreshToken
		if (!oldRefreshToken) {
			reply.status(401).send({ error: "Refresh token is required" })
			return
		}

		try {
			const { accessToken, refreshToken } =
				await this.authService.refresh(oldRefreshToken)

			reply.setCookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				path: "/",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7,
			})

			reply.send({ accessToken })
		} catch (err) {
			reply.status(401).send({ error: "Invalid refresh token" })
		}
	}
}
