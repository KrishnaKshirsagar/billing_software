import prisma from "../../config/database";
import { CreateBrandInput, UpdateBrandInput } from "./brand.types";

export const createBrand = async (shopId: string, data: CreateBrandInput) => {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Brand name is required");
  }

  const existing = await prisma.brand.findFirst({
    where: {
      shopId,
      name,
    },
  });

  if (existing) {
    throw new Error("Brand already exists");
  }

  return prisma.brand.create({
    data: {
      shopId,
      name,
      description: data.description?.trim() || null,
    },
  });
};

export const getBrands = async (shopId: string) => {
  return prisma.brand.findMany({
    where: {
      shopId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const updateBrand = async (
  shopId: string,
  brandId: string,
  data: UpdateBrandInput,
) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      shopId,
    },
  });

  if (!brand) {
    throw new Error("Brand not found");
  }

  if (data.name !== undefined) {
    const name = data.name.trim();

    const duplicate = await prisma.brand.findFirst({
      where: {
        shopId,
        name,
        NOT: {
          id: brandId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Brand already exists");
    }
  }

  return prisma.brand.update({
    where: {
      id: brandId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),
      ...(data.description !== undefined && {
        description: data.description.trim() || null,
      }),
      ...(data.status !== undefined && {
        status: data.status,
      }),
    },
  });
};

export const deleteBrand = async (shopId: string, brandId: string) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: brandId,
      shopId,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!brand) {
    throw new Error("Brand not found");
  }

  if (brand._count.products > 0) {
    throw new Error("Cannot delete brand because products are using it");
  }

  await prisma.brand.delete({
    where: {
      id: brandId,
    },
  });

  return {
    message: "Brand deleted successfully",
  };
};
