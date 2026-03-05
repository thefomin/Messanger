import { FastifyReply, FastifyRequest } from "fastify"
import { UsersService } from "./users.service"

export class UsersController {
	public constructor(private readonly usersService: UsersService) {}

	public getUserByUsername = async (
		req: FastifyRequest<{ Querystring: { username: string } }>,
		reply: FastifyReply,
	) => {
		const { username } = req.query

		const user = await this.usersService.getUserByUsername(username)

		if (!user) {
			reply.status(404).send({ error: "User not found" })
			return
		}

		reply.send(user)
	}

	public searchUsersByUsername = async (
		req: FastifyRequest<{ Querystring: { username?: string; limit?: string } }>,
		reply: FastifyReply,
	) => {
		const { username, limit } = req.query
		let limitNum = limit ? Number(limit) : 20
		if (isNaN(limitNum) || limitNum <= 0) limitNum = 20

		const users = await this.usersService.searchUsersByUsername(
			username,
			limitNum,
		)
		reply.send(users)
	}
}
