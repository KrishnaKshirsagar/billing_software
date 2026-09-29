import prisma from "../../config/database";
import { hashPassword } from "../../utils/password";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from "./user.types";

export const createUser = async (shopId: string, data: CreateUserInput) => {
  const email = data.email.trim().toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      shopId,
      email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists in this shop");
  }

  const role = await prisma.role.findFirst({
    where: {
      id: data.roleId,
      shopId,
    },
  });

  if (!role) {
    throw new Error("Role not found in this shop");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      shopId,
      roleId: role.id,
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim() || null,
      email,
      passwordHash,
      status: "ACTIVE",
    },
    select: {
      id: true,
      shopId: true,
      roleId: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  return user;
};

export const getUsers = async (shopId: string) => {
  return prisma.user.findMany({
    where: {
      shopId,
    },
    select: {
      id: true,
      shopId: true,
      roleId: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUserById = async (shopId: string, userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      shopId,
    },
    select: {
      id: true,
      shopId: true,
      roleId: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUser = async (
  shopId: string,
  userId: string,
  data: UpdateUserInput,
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      shopId,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (existingUser.roleId) {
    const currentRole = await prisma.role.findUnique({
      where: {
        id: existingUser.roleId,
      },
    });

    if (currentRole?.name === "OWNER") {
      throw new Error("OWNER user cannot be modified");
    }
  }

  if (data.email) {
    const email = data.email.trim().toLowerCase();

    const duplicateUser = await prisma.user.findFirst({
      where: {
        shopId,
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (duplicateUser) {
      throw new Error("User with this email already exists in this shop");
    }
  }

  if (data.roleId) {
    const role = await prisma.role.findFirst({
      where: {
        id: data.roleId,
        shopId,
      },
    });

    if (!role) {
      throw new Error("Role not found in this shop");
    }

    if (role.name === "OWNER") {
      throw new Error("Cannot assign OWNER role");
    }
  }

  const updateData: {
    firstName?: string;
    lastName?: string | null;
    email?: string;
    passwordHash?: string;
    roleId?: string;
  } = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName.trim() || null;
  }

  if (data.email !== undefined) {
    updateData.email = data.email.trim().toLowerCase();
  }

  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  if (data.roleId !== undefined) {
    updateData.roleId = data.roleId;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    select: {
      id: true,
      shopId: true,
      roleId: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });
};

export const updateUserStatus = async (
  shopId: string,
  userId: string,
  data: UpdateUserStatusInput,
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      shopId,
    },
    include: {
      role: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (existingUser.role.name === "OWNER") {
    throw new Error("OWNER user status cannot be changed");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: data.status,
    },
    select: {
      id: true,
      shopId: true,
      roleId: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });
};

export const deleteUser = async (shopId: string, userId: string) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      shopId,
    },
    include: {
      role: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (existingUser.role.name === "OWNER") {
    throw new Error("OWNER user cannot be deleted");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    message: "User deleted successfully",
  };
};
