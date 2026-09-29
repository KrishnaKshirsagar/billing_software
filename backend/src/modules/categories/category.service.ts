import prisma from "../../config/database";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";

export const createCategory = async (
  shopId: string,
  data: CreateCategoryInput,
) => {
  const name = data.name.trim();

  if (!name) {
    throw new Error("Category name is required");
  }

  const existing = await prisma.category.findFirst({
    where: {
      shopId,
      name,
    },
  });

  if (existing) {
    throw new Error("Category already exists");
  }

  return prisma.category.create({
    data: {
      shopId,
      name,
      description: data.description?.trim() || null,
    },
  });
};

export const getCategories = async (shopId: string) => {
  return prisma.category.findMany({
    where: {
      shopId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const updateCategory = async (
  shopId: string,
  categoryId: string,
  data: UpdateCategoryInput,
) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      shopId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (data.name !== undefined) {
    const name = data.name.trim();

    const duplicate = await prisma.category.findFirst({
      where: {
        shopId,
        name,
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Category already exists");
    }
  }

  return prisma.category.update({
    where: {
      id: categoryId,
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

export const deleteCategory = async (shopId: string, categoryId: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
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

  if (!category) {
    throw new Error("Category not found");
  }

  if (category._count.products > 0) {
    throw new Error("Cannot delete category because products are using it");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return {
    message: "Category deleted successfully",
  };
};
