import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { create, list, remove, update } from "./brand.controller";

const router = Router();

router.use(authenticate);

router.post("/", requirePermission("brands", "create"), create);

router.get("/", requirePermission("brands", "read"), list);

router.put("/:id", requirePermission("brands", "update"), update);

router.delete("/:id", requirePermission("brands", "delete"), remove);

export default router;
