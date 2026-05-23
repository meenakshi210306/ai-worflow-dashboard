import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { createApp } from "./app";

const app = createApp();

async function bootstrap() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`API server listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
