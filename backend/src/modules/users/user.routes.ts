import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
  updateUserStatusController,
} from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.use(authenticate);

router.post("/", requirePermission("users", "create"), createUserController);

router.get("/", requirePermission("users", "read"), getUsersController);

router.get("/:id", requirePermission("users", "read"), getUserByIdController);

router.put("/:id", requirePermission("users", "update"), updateUserController);

router.patch(
  "/:id/status",
  requirePermission("users", "status"),
  updateUserStatusController,
);

router.delete(
  "/:id",
  requirePermission("users", "delete"),
  deleteUserController,
);

export default router;
