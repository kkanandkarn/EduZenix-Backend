import { Prisma, Status } from "../../../generated/prisma/client";

export interface PermissionBody {
  permissionName: string;
  parent: string;
  module: string;
  displayName: string;
  description?: string;
}
export interface AddGlobalPermissionBody {
  permissions: Array<PermissionBody>;
}
export interface UpdateGlobalPermissionBody {
  id: string;
  permission: PermissionBody;
}
export interface SaveConstantBody {
  name: string;
  data: Prisma.InputJsonObject;
  status: Status;
}
