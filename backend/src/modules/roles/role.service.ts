import prisma from "../../config/database";
import { CreateRoleRequest, UpdateRoleRequest } from "./role.types";

export const createRole = async (shopId: string, data: CreateRoleRequest) => {
  const name = data.name.trim().toUpperCase();

  const existingRole = await prisma.role.findFirst({
    where: {
      shopId,
      name,
    },
  });

  if (existingRole) {
    throw new Error("Role already exists");
  }

  if (data.permissionIds?.length) {
    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: data.permissionIds,
        },
        shopId,
      },
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new Error("One or more permissions do not belong to this shop");
    }
  }

  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        shopId,
        name,
        description: data.description?.trim() || null,
      },
    });

    if (data.permissionIds?.length) {
      await tx.rolePermission.createMany({
        data: data.permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }

    return tx.role.findUnique({
      where: {
        id: role.id,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });
};

export const getRoles = async (shopId: string) => {
  return prisma.role.findMany({
    where: {
      shopId,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getRoleById = async (shopId: string, roleId: string) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      shopId,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  return role;
};

export const updateRole = async (
  shopId: string,
  roleId: string,
  data: UpdateRoleRequest,
) => {
  const existingRole = await prisma.role.findFirst({
    where: {
      id: roleId,
      shopId,
    },
  });

  if (!existingRole) {
    throw new Error("Role not found");
  }

  if (existingRole.name === "OWNER") {
    throw new Error("OWNER role cannot be modified");
  }

  const updateData: {
    name?: string;
    description?: string | null;
    status?: "ACTIVE" | "INACTIVE";
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim().toUpperCase();
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim() || null;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.permissionIds !== undefined) {
    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: data.permissionIds,
        },
        shopId,
      },
    });

    if (permissions.length !== data.permissionIds.length) {
      throw new Error("One or more permissions do not belong to this shop");
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: {
        id: roleId,
      },
      data: updateData,
    });

    if (data.permissionIds !== undefined) {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      if (data.permissionIds.length) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    }

    return tx.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });
};

export const deleteRole = async (shopId: string, roleId: string) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      shopId,
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.name === "OWNER") {
    throw new Error("OWNER role cannot be deleted");
  }

  if (role._count.users > 0) {
    throw new Error("Cannot delete a role assigned to users");
  }

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });

  return {
    message: "Role deleted successfully",
  };
};

export const createPermission = async (
  shopId: string,
  data: {
    module: string;
    action: string;
    description?: string;
  },
) => {
  const module = data.module.trim().toLowerCase();
  const action = data.action.trim().toLowerCase();

  const existingPermission = await prisma.permission.findFirst({
    where: {
      shopId,
      module,
      action,
    },
  });

  if (existingPermission) {
    throw new Error("Permission already exists");
  }

  return prisma.permission.create({
    data: {
      shopId,
      module,
      action,
      description: data.description?.trim() || null,
    },
  });
};

export const getPermissions = async (shopId: string) => {
  return prisma.permission.findMany({
    where: {
      shopId,
    },
    orderBy: [
      {
        module: "asc",
      },
      {
        action: "asc",
      },
    ],
  });
};

export const updateRolePermissions = async (
  shopId: string,
  roleId: string,
  permissionIds: string[],
) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      shopId,
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.name === "OWNER") {
    throw new Error("OWNER permissions cannot be modified");
  }

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: permissionIds,
      },
      shopId,
    },
  });

  if (permissions.length !== permissionIds.length) {
    throw new Error("One or more permissions do not belong to this shop");
  }

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    if (permissionIds.length) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }
  });

  return getRoleById(shopId, roleId);
};
