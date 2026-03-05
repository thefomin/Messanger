import { PrismaService } from "@/infra/prisma"

export class UsersService {
	public async getUserByUsername(username: string) {
		const existingUser = await PrismaService.user.findUnique({
			where: { username },
		})
		return existingUser
	}

	public async searchUsersByUsername(username?: string, limit: number = 20) {
		const users = await PrismaService.user.findMany({
			where: {
				username: {
					contains: username,
					mode: "insensitive",
				},
			},
			take: limit,
			select: {
				id: true,
				username: true,
			},
			orderBy: {
				username: "asc",
			},
		})
		return users
	}
}
