

import Fastify from "fastify";
import { authRoutes } from "./api/auth/auth.routes";


export const app = Fastify({
  logger: true,
});

app.get("/", async () => ({ status: "ok123" }));

app.register(authRoutes);