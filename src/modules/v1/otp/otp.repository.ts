import { prisma } from "../../../config";
import { OtpType } from "../../../generated/prisma/enums";
import { OtpReason, SaveOtpBody } from "./otp.type";

class OtpRepository {
  private readonly db: typeof prisma;
  constructor() {
    this.db = prisma;
  }
  async getOtpData(otpIdentifier: string, otpReason: OtpReason, otpType: OtpType) {
    return await this.db.otp.findFirst({
      where: { otpIdentifier, otpReason, otpType, status: "ACTIVE" },
    });
  }
  async saveOtp(body: SaveOtpBody) {
    const { otpIdentifier, otpReason, otpType, otp } = body;
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpData = await this.getOtpData(otpIdentifier, otpReason, otpType);
    if (otpData) {
      return await this.db.otp.updateMany({
        where: {
          otpIdentifier,
          otpReason,
          otpType,
        },
        data: {
          otp,
          isUsed: false,
          createdAt: new Date(),
          expiredAt,
          usedAt: null,
        },
      });
    }
    return await this.db.otp.create({
      data: {
        ...body,
        expiredAt,
      },
    });
  }
  async markOtpUsed(id: string) {
    return await this.db.otp.update({
      where: {
        id,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });
  }
}
export default OtpRepository;
