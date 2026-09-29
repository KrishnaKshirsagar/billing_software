import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";

import {
  create,
  createPermissionController,
  getOne,
  list,
  listPermissions,
  remove,
  update,
  updatePermissions,
} from "./role.controller";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/", list);

router.get("/permissions", listPermissions);

router.post("/permissions", createPermissionController);

router.get("/:id", getOne);

router.put("/:id", update);

router.put("/:id/permissions", updatePermissions);

router.delete("/:id", remove);

export default router;
