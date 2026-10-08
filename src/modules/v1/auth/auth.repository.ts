import { prisma } from "../../../config";
class AuthRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }
  async getUserByEmail(email: string, sensitive: boolean = false) {
    return await this.db.users.findFirst({
      where: { email, status: { not: "DELETED" } },
      include: { role: true, tenant: true },
      omit: {
        password: !sensitive,
        refreshToken: !sensitive,
        mfaSecret: !sensitive,
      },
    });
  }
  async getUserById(userId: string, sensitive: boolean = false) {
    return await this.db.users.findFirst({
      where: { id: userId, status: { not: "DELETED" } },
      include: { role: true, tenant: true },
      omit: {
        password: !sensitive,
        refreshToken: !sensitive,
        mfaSecret: !sensitive,
      },
    });
  }
  async getRolePermissions(roleId: string) {
    const permissions = await this.db.globalRolePermissions.findMany({
      where: { roleId, status: "ACTIVE" },
      select: {
        permissionId: true,
        roleId: true,
        permission: { select: { permissionName: true, parent: true } },
      },
    });
    return permissions.map((permission) => ({
      roleId: permission.roleId,
      permissionId: permission.permissionId,
      permissionName: permission.permission.permissionName,
      parent: permission.permission.parent,
    }));
  }
  async removeRefereshToken(userId: string) {
    return await this.db.users.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
  async addRefereshToken(userId: string, refreshToken: string) {
    return await this.db.users.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
export default AuthRepository;
