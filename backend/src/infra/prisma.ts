import { PrismaClient } from "@prisma/__generated__"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const PrismaService = new PrismaClient({ adapter })

async function test() {
	try {
		await PrismaService.$connect()
		console.log("✅ Connected to Postgres")
	} catch (err) {
		console.error("❌ Prisma connection error:", err)
	}
}

test()

export { PrismaService }
