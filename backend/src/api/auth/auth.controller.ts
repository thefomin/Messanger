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
				.status(401)
				.send({ error: "Email, username and password are required" })
		}

		const user = await this.authService.register(email, username, password)

		reply.send(user)
	}

	public login = async (
		req: FastifyRequest<{ Body: LoginDto }>,
		reply: FastifyReply,
	) => {
		const { email, password } = req.body

		if (!email || !password) {
			reply.status(400).send({ error: "Email and password are required" })
		}

		const result = await this.authService.login(email, password)

		reply.setCookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/auth/refresh",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 дней
		})
		reply.send(result)
	}

	public logout = async (req: any, reply: FastifyReply) => {
		await this.authService.logout(req.user.sessionId)

		reply.send({ ok: true })
	}

	public refresh = async (req: FastifyRequest, reply: FastifyReply) => {
		const refreshToken = req.cookies?.refreshToken
		if (!refreshToken) {
			reply.status(401).send({ error: "Refresh token is required" })
			return
		}

		const result = await this.authService.refresh(refreshToken)
		reply.send(result) // возвращаем новый access token
	}
}
