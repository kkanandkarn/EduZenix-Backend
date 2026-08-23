import { throwError } from "../../../utils/helper";
import AdminRepository from "./admin.repository";
import { AddGlobalPermissionBody, UpdateGlobalPermissionBody } from "./admin.type";

class AdminService {
  private readonly repository: AdminRepository;
  constructor() {
    this.repository = new AdminRepository();
  }
  async addGlobalPermissions(body: AddGlobalPermissionBody) {
    try {
      const { permissions } = body;
      return await this.repository.addGlobalPermissions(permissions);
    } catch (error) {
      throwError(error);
    }
  }
  async updateGlobalPermission(body: UpdateGlobalPermissionBody) {
    try {
      const { id, permission } = body;
      return await this.repository.updateGlobalPermission(id, permission);
    } catch (error) {
      throwError(error);
    }
  }
  async listGlobalPermissions() {
    try {
      return await this.repository.listGlobalPermissions();
    } catch (error) {
      throwError(error);
    }
  }
}
export default AdminService;
