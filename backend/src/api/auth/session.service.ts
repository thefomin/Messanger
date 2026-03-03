
import { redis } from "../../config/redis.config";
import { randomUUID } from "crypto";

export class SessionService {
  private static PREFIX = "session:";
  private static TTL = 60 * 60 * 24 * 7;

  static async create(userId: string) {
    const sessionId = randomUUID();

    await redis.set(
      this.PREFIX + sessionId,
      userId,
      "EX",
      this.TTL
    );

    return sessionId;
  }

  static async validate(sessionId: string) {
    return redis.get(this.PREFIX + sessionId);
  }

  static async delete(sessionId: string) {
    await redis.del(this.PREFIX + sessionId);
  }
}