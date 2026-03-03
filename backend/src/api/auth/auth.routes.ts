import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "./auth.middleware";
import { AuthService } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {

  const authService = new AuthService();
  const controller = new AuthController(authService);

  app.post("/register", controller.register);
  app.post("/login", controller.login);

  app.post(
    "/logout",
    { preHandler: AuthMiddleware.verify },
    controller.logout
  );
}