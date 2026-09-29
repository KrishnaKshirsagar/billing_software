import prisma from "../../config/database";
import { CreateUnitInput, UpdateUnitInput } from "./unit.types";

export const createUnit = async (shopId: string, data: CreateUnitInput) => {
  const name = data.name.trim();
  const shortName = data.shortName.trim();

  if (!name || !shortName) {
    throw new Error("Unit name and shortName are required");
  }

  const existing = await prisma.unit.findFirst({
    where: {
      shopId,
      OR: [{ name }, { shortName }],
    },
  });

  if (existing) {
    throw new Error("Unit name or short name already exists");
  }

  return prisma.unit.create({
    data: {
      shopId,
      name,
      shortName,
    },
  });
};

export const getUnits = async (shopId: string) => {
  return prisma.unit.findMany({
    where: {
      shopId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const updateUnit = async (
  shopId: string,
  unitId: string,
  data: UpdateUnitInput,
) => {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      shopId,
    },
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  const name = data.name !== undefined ? data.name.trim() : unit.name;

  const shortName =
    data.shortName !== undefined ? data.shortName.trim() : unit.shortName;

  const duplicate = await prisma.unit.findFirst({
    where: {
      shopId,
      OR: [{ name }, { shortName }],
      NOT: {
        id: unitId,
      },
    },
  });

  if (duplicate) {
    throw new Error("Unit name or short name already exists");
  }

  return prisma.unit.update({
    where: {
      id: unitId,
    },
    data: {
      name,
      shortName,
      ...(data.status !== undefined && {
        status: data.status,
      }),
    },
  });
};

export const deleteUnit = async (shopId: string, unitId: string) => {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
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

  if (!unit) {
    throw new Error("Unit not found");
  }

  if (unit._count.products > 0) {
    throw new Error("Cannot delete unit because products are using it");
  }

  await prisma.unit.delete({
    where: {
      id: unitId,
    },
  });

  return {
    message: "Unit deleted successfully",
  };
};
