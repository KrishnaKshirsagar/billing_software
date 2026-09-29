import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  updateProductStatus,
} from "./product.service";

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

    const product = await createProduct(req.user.shopId, req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create product",
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

    const products = await getProducts(req.user.shopId, {
      search:
        typeof req.query.search === "string" ? req.query.search : undefined,

      categoryId:
        typeof req.query.categoryId === "string"
          ? req.query.categoryId
          : undefined,

      brandId:
        typeof req.query.brandId === "string" ? req.query.brandId : undefined,

      status:
        req.query.status === "ACTIVE" || req.query.status === "INACTIVE"
          ? req.query.status
          : undefined,
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch products",
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

    const product = await getProductById(
      req.user.shopId,
      String(req.params.id),
    );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Product not found",
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

    const product = await updateProduct(
      req.user.shopId,
      String(req.params.id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update product",
    });
  }
};

export const updateStatus = async (
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

    const { status } = req.body;

    if (status !== "ACTIVE" && status !== "INACTIVE") {
      res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
      return;
    }

    const product = await updateProductStatus(
      req.user.shopId,
      String(req.params.id),
      status,
    );

    res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product status",
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

    const result = await deleteProduct(req.user.shopId, String(req.params.id));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete product",
    });
  }
};
