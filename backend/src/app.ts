import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { ApiModule } from "./api/api.module"
import fastifyCookie from "@fastify/cookie"

export const app = Fastify({ logger: true })

app.register(websocket)
app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET || "default_cookie_secret",
	parseOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	},
})
ApiModule(app)
