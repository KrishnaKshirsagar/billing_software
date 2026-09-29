import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { createUnit, deleteUnit, getUnits, updateUnit } from "./unit.service";

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

    const unit = await createUnit(req.user.shopId, req.body);

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create unit",
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

    const units = await getUnits(req.user.shopId);

    res.status(200).json({
      success: true,
      data: units,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch units",
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

    const unit = await updateUnit(
      req.user.shopId,
      String(req.params.id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: unit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update unit",
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

    const result = await deleteUnit(req.user.shopId, String(req.params.id));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete unit",
    });
  }
};
