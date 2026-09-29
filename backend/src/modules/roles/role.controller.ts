import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

import {
  createPermission,
  createRole,
  deleteRole,
  getPermissions,
  getRoleById,
  getRoles,
  updateRole,
  updateRolePermissions,
} from "./role.service";

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { name, description, permissionIds } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Role name is required",
      });
      return;
    }

    const role = await createRole(req.user.shopId, {
      name,
      description,
      permissionIds,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create role",
    });
  }
};

export const list = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const roles = await getRoles(req.user.shopId);

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};

export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const roleId = req.params.id;

    if (typeof roleId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
      return;
    }

    const role = await getRoleById(req.user.shopId, roleId);

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Role not found",
    });
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const roleId = req.params.id;

    if (typeof roleId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
      return;
    }

    const role = await updateRole(req.user.shopId, roleId, req.body);

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update role",
    });
  }
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const roleId = req.params.id;

    if (typeof roleId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
      return;
    }

    const result = await deleteRole(req.user.shopId, roleId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete role",
    });
  }
};

export const createPermissionController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { module, action, description } = req.body;

    if (!module || !action) {
      res.status(400).json({
        success: false,
        message: "module and action are required",
      });
      return;
    }

    const permission = await createPermission(req.user.shopId, {
      module,
      action,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create permission",
    });
  }
};

export const listPermissions = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const permissions = await getPermissions(req.user.shopId);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};

export const updatePermissions = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      res.status(400).json({
        success: false,
        message: "permissionIds must be an array",
      });
      return;
    }

    const roleId = req.params.id;

    if (typeof roleId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
      return;
    }

    const role = await updateRolePermissions(
      req.user.shopId,
      roleId,
      permissionIds,
    );

    res.status(200).json({
      success: true,
      message: "Role permissions updated successfully",
      data: role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update permissions",
    });
  }
};
