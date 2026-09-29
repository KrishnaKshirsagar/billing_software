import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "./brand.service";

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

    const brand = await createBrand(req.user.shopId, req.body);

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create brand",
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

    const brands = await getBrands(req.user.shopId);

    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
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

    const brand = await updateBrand(
      req.user.shopId,
      String(req.params.id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update brand",
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

    const result = await deleteBrand(req.user.shopId, String(req.params.id));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete brand",
    });
  }
};
