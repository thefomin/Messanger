import Redis from "ioredis";
import { env } from ".";

export const redis = new Redis(env.REDIS_URI);

