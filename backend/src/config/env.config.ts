import "dotenv/config";

export const env = {
  REDIS_URI: process.env.REDIS_URI,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  JWT_SECRET: process.env.JWT_SECRET!,
  PORT: process.env.HTTP_PORT || 3000,
  HOST: process.env.HTTP_HOST!
};