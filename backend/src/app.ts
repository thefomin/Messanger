import Fastify from "fastify";

const app = Fastify({
  logger: true
});

app.get("/", async () => {
  return { status: "ok123" };
});

app.listen({ port: 3000 });