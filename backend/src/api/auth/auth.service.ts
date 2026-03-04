import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { PrismaService } from "../../infra/prisma";
import { SessionService } from "./session.service";
import { env } from "../../config/env.config";

export class AuthService {
  public async register(email: string, username: string, password: string) {
    const hash = await argon2.hash(password);

    return PrismaService.user.create({
      data: { email, username, password: hash },
    });
  }

  public async login(email: string, password: string) {
    const user = await PrismaService.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("Invalid credentials");

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error("Invalid password");

    const sessionId = await SessionService.create(user.id);

    const token = jwt.sign(
      { userId: user.id, sessionId },
      env.JWT_SECRET,
      {expiresIn: '7d'}
    );

    return { token };
  }

  public async logout(sessionId: string) {
    await SessionService.delete(sessionId);
  }
}