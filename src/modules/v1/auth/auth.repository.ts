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
      include: { role: true },
      omit: {
        password: !sensitive,
        refreshToken: !sensitive,
        mfaSecret: !sensitive,
      },
    });
  }
}
export default AuthRepository;
