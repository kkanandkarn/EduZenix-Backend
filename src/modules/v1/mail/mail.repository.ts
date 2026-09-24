import { prisma } from "../../../config";

class MailRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }
  async getMailTemplate(name: string) {
    return await this.db.mailTemplates.findFirst({ where: { name, status: "ACTIVE" } });
  }
}
export default MailRepository;
