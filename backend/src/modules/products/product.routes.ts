import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import {
  create,
  getOne,
  list,
  remove,
  update,
  updateStatus,
} from "./product.controller";

const router = Router();

router.use(authenticate);

router.post("/", requirePermission("products", "create"), create);

router.get("/", requirePermission("products", "read"), list);

router.get("/:id", requirePermission("products", "read"), getOne);

router.put("/:id", requirePermission("products", "update"), update);

router.patch(
  "/:id/status",
  requirePermission("products", "status"),
  updateStatus,
);

router.delete("/:id", requirePermission("products", "delete"), remove);

export default router;
