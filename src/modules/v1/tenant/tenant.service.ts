import { Prisma } from "../../../generated/prisma/client";
import { ErrorHandler } from "../../../helper";
import { RequestUser } from "../../../types/express";
import { throwError } from "../../../utils/helper";
import { CONFLICT } from "../../../utils/status-codes";
import TenantRepository from "./tenant.repository";
import { CreateTenantBody } from "./tenant.type";

class TenantService {
  async createTenant(body: CreateTenantBody, reqUser: RequestUser, db: Prisma.TransactionClient) {
    try {
      const { tenant, role, user, modules = [] } = body;
      const repository = new TenantRepository(db);
      const isExists = await repository.getTenantByName(tenant.tenantName);
      if (isExists) throw new ErrorHandler(CONFLICT, "Tenant with this name already exists");
      const { tenantId } = await repository.createTenant(tenant, reqUser);

      const isRoleExists = await repository.getRoleByName(role.roleName, tenantId);
      if (isRoleExists) throw new ErrorHandler(CONFLICT, "Role with this name already exists");

      const { roleId } = await repository.createRole(tenantId, role, reqUser);

      const isUserExists = await repository.getUserByEmail(user.email, tenantId);
      if (isUserExists) throw new ErrorHandler(CONFLICT, "User with this email already exists");

      await repository.createUser(tenantId, roleId, user, reqUser);

      await repository.updateUserCount(roleId);

      if (modules.length) {
        await repository.addModulePermissions(tenantId, roleId, modules, reqUser);
      }

      return {
        message: "Tenant created successfully",
        tenantId,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default TenantService;
