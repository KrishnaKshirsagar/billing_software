import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserStatus,
} from "./user.service";

export const createUserController = async (
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

    const { firstName, lastName, email, password, roleId } = req.body;

    if (!firstName || !email || !password || !roleId) {
      res.status(400).json({
        success: false,
        message: "firstName, email, password and roleId are required",
      });
      return;
    }

    const user = await createUser(req.user.shopId, {
      firstName,
      lastName,
      email,
      password,
      roleId,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    });
  }
};

export const getUsersController = async (
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

    const users = await getUsers(req.user.shopId);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserByIdController = async (
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

    const userId = String(req.params.id);

    const user = await getUserById(req.user.shopId, userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "User not found",
    });
  }
};

export const updateUserController = async (
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

    const userId = String(req.params.id);

    const user = await updateUser(req.user.shopId, userId, req.body);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user",
    });
  }
};

export const updateUserStatusController = async (
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

    const userId = String(req.params.id);

    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
      return;
    }

    const user = await updateUserStatus(req.user.shopId, userId, { status });

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user status",
    });
  }
};

export const deleteUserController = async (
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

    const userId = String(req.params.id);

    const result = await deleteUser(req.user.shopId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    });
  }
};
