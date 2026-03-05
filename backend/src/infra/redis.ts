import Redis from "ioredis"
import { env } from "../config"

export const redis = new Redis(env.REDIS_URI!)

async function test() {
	try {
		await redis.connect()
		console.log("✅ Connected to Redis")
	} catch (err) {
		console.error("❌ Redis connection error:", err)
	}
}

test()
