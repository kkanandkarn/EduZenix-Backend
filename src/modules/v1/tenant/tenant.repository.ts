import { prisma } from "../../../config";
import { AuthStatus, Prisma, RoleType, UserType } from "../../../generated/prisma/client";
import { RequestUser } from "../../../types/express";
import { RoleBody, TenantBody, UserBody } from "./tenant.type";
class TenantRepository {
  private readonly db: Prisma.TransactionClient | typeof prisma;

  constructor(db?: Prisma.TransactionClient) {
    this.db = db || prisma;
  }
  async getTenantByName(tenantName: string) {
    return await this.db.tenants.findUnique({
      where: { tenantName },
      select: {
        id: true,
      },
    });
  }
  async getTenantById(id: string) {
    return await this.db.tenants.findUnique({
      where: { id },
      select: {
        id: true,
        tenantName: true,
        tenantType: true,
        pocName: true,
        pocEmail: true,
        pocContact: true,
        packageStatus: true,
        packageStartAt: true,
        packageExpiredAt: true,
        package: {
          select: {
            packageName: true,
          },
        },
        status: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        updater: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdAt: true,
      },
    });
  }
  async createTenant(data: TenantBody, user: RequestUser) {
    const tenant = await this.db.tenants.create({
      data: {
        tenantName: data.tenantName,
        tenantType: data.tenantType || "ADMIN",
        pocName: data.pocName || null,
        pocEmail: data.pocEmail || null,
        pocContact: data.pocContact || null,
        status: data.status || AuthStatus.ACTIVE,
        createdBy: user.userId || null,
        updatedBy: user.userId || null,
      },
      select: { id: true },
    });
    const tenantId = tenant.id;
    return { tenantId };
  }
  async getRoleByName(roleName: string, tenantId: string) {
    return await this.db.roles.findFirst({
      where: {
        roleName,
        tenantId,
        status: {
          not: "DELETED",
        },
      },
      select: {
        id: true,
      },
    });
  }
  async createRole(tenantId: string, data: RoleBody, user: RequestUser) {
    const role = await this.db.roles.create({
      data: {
        roleName: data.roleName,
        roleDescription: data.roleDescription || null,
        tenantId,
        roleType: RoleType.ADMIN,
        status: data.status || AuthStatus.ACTIVE,
        createdBy: user.userId || null,
        updatedBy: user.userId || null,
      },
      select: { id: true },
    });
    const roleId = role.id;
    return { roleId };
  }
  async getUserByEmail(email: string, tenantId: string) {
    return await this.db.users.findFirst({
      where: {
        email,
        tenantId,
        status: {
          not: "DELETED",
        },
      },
      select: {
        id: true,
      },
    });
  }
  async createUser(tenantId: string, roleId: string, data: UserBody, user: RequestUser) {
    const newUser = await this.db.users.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roleId,
        requireMfa: data.requireMfa || false,
        tenantId,
        userType: UserType.ADMIN,
        status: data.status || AuthStatus.ACTIVE,
        createdBy: user.userId || null,
        updatedBy: user.userId || null,
      },
      select: { id: true },
    });
    const userId = newUser.id;
    return { userId };
  }

  async addModulePermissions(
    tenantId: string,
    roleId: string,
    modules: string[],
    user: RequestUser,
  ) {
    const permissions = await this.db.globalPermissionMaster.findMany({
      where: { module: { in: modules } },
      select: { id: true },
    });
    await this.db.globalTenantPermissions.createMany({
      data: permissions.map((permission) => ({
        tenantId,
        permissionId: permission.id,
        createdBy: user.userId || null,
        updatedBy: user.userId || null,
      })),
    });
    await this.db.globalRolePermissions.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
        createdBy: user.userId || null,
        updatedBy: user.userId || null,
      })),
    });
  }
  async updateUserCount(roleId: string) {
    const totalUsers = await this.db.users.count({ where: { roleId } });
    await this.db.roles.update({ where: { id: roleId }, data: { totalUsers: totalUsers } });
  }
}
export default TenantRepository;
