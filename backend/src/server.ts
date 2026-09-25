import app from "./app";
import { env } from "./config/env";
import prisma from "./config/database";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received. Shutting down...`);

  await prisma.$disconnect();

  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
