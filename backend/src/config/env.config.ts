import "dotenv/config";

export const env = {
  REDIS_URL: process.env.REDIS_URI!,
  NODE_ENV: process.env.NODE_ENV ?? "development"
};