import type { RequestUser } from "../../../types/express";
import { throwError } from "../../../utils/helper";
import CrmRepository from "./crm.repository";
import { BulkAddUniversityBody } from "./crm.type";

class CrmService {
  private readonly repositoy: CrmRepository;
  constructor() {
    this.repositoy = new CrmRepository();
  }
  async bulkAddUniversity(body: BulkAddUniversityBody, user: RequestUser) {
    try {
      const aisheCodes = body.universities.map((university) => university.aisheCode);
      const existingUniversities = await this.repositoy.getBulkUniversityByAisheCode(aisheCodes);
      const existingAisheCodes = new Set(
        existingUniversities.map((university) => university.aisheCode),
      );
      const newUniversities = body.universities.filter(
        (university) => !existingAisheCodes.has(university.aisheCode),
      );
      if (newUniversities.length > 0) {
        await this.repositoy.bulkAddUniversity(newUniversities);
      }
      return {
        message: "Universities added successfully",
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default CrmService;
