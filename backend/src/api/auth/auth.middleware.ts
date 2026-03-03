import jwt from "jsonwebtoken";
import { SessionService } from "./session.service";
import { env } from "../../config/env.config";

export class AuthMiddleware {

  static async verify(req: any, reply: any) {
    const header = req.headers.authorization;

    if (!header)
      return reply.code(401).send();

    const token = header.split(" ")[1];

    const payload: any = jwt.verify(
      token,
      env.JWT_SECRET
    );

    const session = await SessionService.validate(
      payload.sessionId
    );

    if (!session)
      return reply.code(401).send();

    req.user = payload;
  }
}