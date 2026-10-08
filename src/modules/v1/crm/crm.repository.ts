import { prisma } from "../../../config";
import type { AddUniversityBody } from "./crm.type";
class CrmRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }
  async getBulkUniversityByAisheCode(aisheCode: string[]) {
    return await this.db.crmUniversity.findMany({
      where: { aisheCode: { in: aisheCode } },
    });
  }
  async bulkAddUniversity(body: AddUniversityBody[]) {
    return await this.db.crmUniversity.createMany({
      data: body.map((university) => ({
        aisheCode: university.aisheCode,
        name: university.name,
        state: university.state,
        district: university.district,
        website: university.website ?? null,
        yearOfEstablishment: university.yearOfEstablishment ?? null,
        location: university.location ?? null,
        pocName: university.pocName ?? null,
        pocEmail: university.pocEmail ?? null,
        pocContact: university.pocContact ?? null,
        address: university.address ?? null,
      })),
      skipDuplicates: true,
    });
  }
}
export default CrmRepository;
