
import { app } from "./app";
import { env } from "./config";
import "dotenv/config";

async function main() {
  try {
    await app.listen({ port: Number(env.PORT) });
    console.log(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();