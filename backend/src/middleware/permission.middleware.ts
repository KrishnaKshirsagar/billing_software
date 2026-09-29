import { NextFunction, Response } from "express";
import prisma from "../config/database";
import { AuthenticatedRequest } from "./auth.middleware";

export const requirePermission = (module: string, action: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          id: req.user.userId,
          shopId: req.user.shopId,
          status: "ACTIVE",
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
          shop: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found or inactive",
        });
        return;
      }

      if (!user.shop.isActive) {
        res.status(403).json({
          success: false,
          message: "Shop is inactive",
        });
        return;
      }

      /*
       * OWNER has full access to their own shop.
       */
      if (user.role.name === "OWNER") {
        next();
        return;
      }

      const hasPermission = user.role.permissions.some(
        (rolePermission) =>
          rolePermission.permission.module === module &&
          rolePermission.permission.action === action,
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: `Permission denied: ${module}.${action}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};
