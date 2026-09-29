import prisma from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { LoginRequest, RegisterRequest } from "./auth.types";

export const registerOwner = async (data: RegisterRequest) => {
  const email = data.email.trim().toLowerCase();

  const existingShopUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (existingShopUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const shop = await tx.shop.create({
      data: {
        name: data.shopName.trim(),
      },
    });

    const role = await tx.role.create({
      data: {
        shopId: shop.id,
        name: "OWNER",
        description: "Shop owner",
      },
    });

    const user = await tx.user.create({
      data: {
        shopId: shop.id,
        roleId: role.id,
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || null,
        email,
        mobile: data.mobile?.trim() || null,
        passwordHash,
      },
    });

    await tx.subscription.create({
      data: {
        shopId: shop.id,
        planName: "TRIAL",
        status: "TRIAL",
        startDate: new Date(),
        maxUsers: 1,
        maxProducts: 1000,
      },
    });

    return {
      shop,
      role,
      user,
    };
  });

  const token = generateToken({
    userId: result.user.id,
    shopId: result.shop.id,
    roleId: result.role.id,
  });

  return {
    token,
    user: {
      id: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      mobile: result.user.mobile,
      role: result.role.name,
      shopId: result.shop.id,
      shopName: result.shop.name,
    },
  };
};

export const loginUser = async (data: LoginRequest) => {
  const email = data.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    include: {
      role: true,
      shop: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User account is not active");
  }

  if (!user.shop.isActive) {
    throw new Error("Shop is not active");
  }

  const passwordValid = await comparePassword(data.password, user.passwordHash);

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  const token = generateToken({
    userId: user.id,
    shopId: user.shopId,
    roleId: user.roleId,
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      role: user.role.name,
      shopId: user.shopId,
      shopName: user.shop.name,
    },
  };
};

export const getCurrentUser = async (userId: string, shopId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      shopId,
    },
    include: {
      role: true,
      shop: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    status: user.status,
    role: user.role.name,
    shopId: user.shopId,
    shopName: user.shop.name,
    shopIsActive: user.shop.isActive,
  };
};
