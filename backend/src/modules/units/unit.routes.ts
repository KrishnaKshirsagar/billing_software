import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { create, list, remove, update } from "./unit.controller";

const router = Router();

router.use(authenticate);

router.post("/", requirePermission("units", "create"), create);

router.get("/", requirePermission("units", "read"), list);

router.put("/:id", requirePermission("units", "update"), update);

router.delete("/:id", requirePermission("units", "delete"), remove);

export default router;
