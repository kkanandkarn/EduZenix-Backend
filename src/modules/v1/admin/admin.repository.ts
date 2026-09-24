import { prisma } from "../../../config";
import { Prisma } from "../../../generated/prisma/client";
import { SaveConstantBody } from "./admin.type";
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
  async saveMailTemplate(data: Prisma.MailTemplatesCreateInput) {
    return await this.db.mailTemplates.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    });
  }
  async saveConstant(body: SaveConstantBody) {
    return await this.db.constant.upsert({
      where: { name: body.name },
      create: { name: body.name, data: body.data, status: body.status },
      update: { data: body.data, status: body.status },
    });
  }
}
export default AdminRepository;
