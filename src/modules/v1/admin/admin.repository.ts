import { prisma } from "../../../config";
import { Prisma } from "../../../generated/prisma/client";
class AdminRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }

  async addGlobalPermissions(data: Prisma.GlobalPermissionMasterCreateInput[]) {
    return await this.db.globalPermissionMaster.createManyAndReturn({
      data,
      select: { id: true, permissionName: true, parent: true },
    });
  }
  async updateGlobalPermission(id: string, data: Prisma.GlobalPermissionMasterUpdateInput) {
    return await this.db.globalPermissionMaster.update({
      where: { id },
      data,
      select: { id: true, permissionName: true, parent: true },
    });
  }
  async listGlobalPermissions() {
    return await this.db.globalPermissionMaster.findMany({ where: { status: { not: "DELETED" } } });
  }
}
export default AdminRepository;
