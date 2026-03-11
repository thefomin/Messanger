import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { ApiModule } from "./api/api.module"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"

export const app = Fastify({ logger: true })

app.register(websocket)
app.register(fastifyCors, {
	origin: "http://localhost:5173",
	credentials: true,
})
app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET || "default_cookie_secret",
	parseOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	},
})
ApiModule(app)
