import prisma from "../../config/database";
import {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "./product.types";

const productInclude = {
  category: true,
  brand: true,
  unit: true,
};

const validateReferences = async (
  shopId: string,
  data: {
    categoryId: string;
    brandId?: string | null;
    unitId: string;
  },
) => {
  const category = await prisma.category.findFirst({
    where: {
      id: data.categoryId,
      shopId,
      isActive: true,
    },
  });

  if (!category) {
    throw new Error("Category not found or inactive");
  }

  const unit = await prisma.unit.findFirst({
    where: {
      id: data.unitId,
      shopId,
      isActive: true,
    },
  });

  if (!unit) {
    throw new Error("Unit not found or inactive");
  }

  if (data.brandId) {
    const brand = await prisma.brand.findFirst({
      where: {
        id: data.brandId,
        shopId,
        isActive: true,
      },
    });

    if (!brand) {
      throw new Error("Brand not found or inactive");
    }
  }
};

export const createProduct = async (
  shopId: string,
  data: CreateProductInput,
) => {
  const name = data.name.trim();
  const sku = data.sku.trim();

  if (!name || !sku) {
    throw new Error("Product name and SKU are required");
  }

  if (data.purchasePrice < 0) {
    throw new Error("Purchase price cannot be negative");
  }

  if (data.sellingPrice < 0) {
    throw new Error("Selling price cannot be negative");
  }

  if ((data.openingStock ?? 0) < 0) {
    throw new Error("Opening stock cannot be negative");
  }

  await validateReferences(shopId, data);

  const duplicateSku = await prisma.product.findFirst({
    where: {
      shopId,
      sku,
    },
  });

  if (duplicateSku) {
    throw new Error("Product SKU already exists");
  }

  if (data.barcode) {
    const duplicateBarcode = await prisma.product.findFirst({
      where: {
        shopId,
        barcode: data.barcode.trim(),
      },
    });

    if (duplicateBarcode) {
      throw new Error("Product barcode already exists");
    }
  }

  return prisma.product.create({
    data: {
      shopId,
      name,
      sku,
      barcode: data.barcode?.trim() || null,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      unitId: data.unitId,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      gstRate: data.gstRate ?? 0,
      openingStock: data.openingStock ?? 0,
      currentStock: data.openingStock ?? 0,
      minimumStock: data.minimumStock ?? 0,
      description: data.description?.trim() || null,
    },
    include: productInclude,
  });
};

export const getProducts = async (shopId: string, query: ProductListQuery) => {
  const search = query.search?.trim();

  return prisma.product.findMany({
    where: {
      shopId,

      ...(query.status && {
        status: query.status,
      }),

      ...(query.categoryId && {
        categoryId: query.categoryId,
      }),

      ...(query.brandId && {
        brandId: query.brandId,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            barcode: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    },

    include: productInclude,

    orderBy: {
      name: "asc",
    },
  });
};

export const getProductById = async (shopId: string, productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId,
    },
    include: productInclude,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const updateProduct = async (
  shopId: string,
  productId: string,
  data: UpdateProductInput,
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const categoryId = data.categoryId ?? product.categoryId;

  const unitId = data.unitId ?? product.unitId;

  const brandId = data.brandId !== undefined ? data.brandId : product.brandId;

  if (!categoryId) {
    throw new Error("Product category is required");
  }

  if (!unitId) {
    throw new Error("Product unit is required");
  }

  await validateReferences(shopId, {
    categoryId,
    brandId,
    unitId,
  });

  if (data.sku !== undefined) {
    const sku = data.sku.trim();

    const duplicate = await prisma.product.findFirst({
      where: {
        shopId,
        sku,
        NOT: {
          id: productId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Product SKU already exists");
    }
  }

  if (data.barcode) {
    const duplicate = await prisma.product.findFirst({
      where: {
        shopId,
        barcode: data.barcode.trim(),
        NOT: {
          id: productId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Product barcode already exists");
    }
  }

  return prisma.product.update({
    where: {
      id: productId,
    },

    data: {
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),

      ...(data.sku !== undefined && {
        sku: data.sku.trim(),
      }),

      ...(data.barcode !== undefined && {
        barcode: data.barcode?.trim() || null,
      }),

      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),

      ...(data.brandId !== undefined && {
        brandId: data.brandId,
      }),

      ...(data.unitId !== undefined && {
        unitId: data.unitId,
      }),

      ...(data.purchasePrice !== undefined && {
        purchasePrice: data.purchasePrice,
      }),

      ...(data.sellingPrice !== undefined && {
        sellingPrice: data.sellingPrice,
      }),

      ...(data.gstRate !== undefined && {
        gstRate: data.gstRate,
      }),

      ...(data.minimumStock !== undefined && {
        minimumStock: data.minimumStock,
      }),

      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
    },

    include: productInclude,
  });
};

export const updateProductStatus = async (
  shopId: string,
  productId: string,
  status: "ACTIVE" | "INACTIVE",
) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      status,
    },
    include: productInclude,
  });
};

export const deleteProduct = async (shopId: string, productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  return {
    message: "Product deleted successfully",
  };
};
