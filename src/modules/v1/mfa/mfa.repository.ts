import { prisma } from "../../../config";
class MfaRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }
  async saveMfaSecret(userId: string, secret: string) {
    await this.db.users.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });
  }
  async updateMfaStatus(userId: string, status: boolean) {
    await this.db.users.update({
      where: { id: userId },
      data: {
        mfaCompleted: status,
        ...(status === false && { mfaSecret: null }),
      },
    });
  }
}
export default MfaRepository;
