import Fastify from "fastify"
import websocket from "@fastify/websocket"
import { ApiModule } from "./api/api.module"

export const app = Fastify({ logger: true })

app.register(websocket)

ApiModule(app)
