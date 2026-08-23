import { AuthStatus, TenantType } from "../../../generated/prisma/enums";

export interface TenantBody {
  tenantName: string;
  tenantType?: TenantType;
  pocName?: string;
  pocEmail?: string;
  pocContact?: string;
  status?: AuthStatus;
}
export interface RoleBody {
  roleName: string;
  roleDescription?: string;
  status?: AuthStatus;
}
export interface UserBody {
  firstName: string;
  lastName: string;
  email: string;
  requireMfa?: boolean;
  status?: AuthStatus;
}
export interface CreateTenantBody {
  tenant: TenantBody;
  role: RoleBody;
  user: UserBody;
  modules?: string[];
}
export interface UpdateTenantBody {
  id: string;
  data: TenantBody;
  modules?: string[];
}
