import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { create, list, remove, update } from "./category.controller";

const router = Router();

router.use(authenticate);

router.post("/", requirePermission("categories", "create"), create);

router.get("/", requirePermission("categories", "read"), list);

router.put("/:id", requirePermission("categories", "update"), update);

router.delete("/:id", requirePermission("categories", "delete"), remove);

export default router;
