import { Router } from "express";
import prisma from "../config/database";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

router.get("/database", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection is healthy",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
    });
  }
});

export default router;
