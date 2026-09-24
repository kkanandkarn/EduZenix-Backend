import { ErrorHandler } from "../../../helper";
import { generateOtp, getConstant, throwError } from "../../../utils/helper";
import { NOT_FOUND } from "../../../utils/status-codes";
import { AuthRepository } from "../auth";
import { MailService } from "../mail";
import OtpRepository from "./otp.repository";
import { SendOtpBody } from "./otp.type";

class OtpHelper {
  private readonly authRepository: AuthRepository;
  private readonly repository: OtpRepository;
  private readonly mailService: MailService;
  constructor() {
    this.repository = new OtpRepository();
    this.authRepository = new AuthRepository();
    this.mailService = new MailService();
  }
  async sendUserLoginOtp(body: SendOtpBody) {
    try {
      const { otpType, otpIdentifier } = body;
      if (otpType === "EMAIL") {
        const user = await this.authRepository.getUserByEmail(otpIdentifier);
        if (!user) throw new ErrorHandler(NOT_FOUND, "User with this email does not exists");
        const otp = await this.generateOtpAndSave(body);
        const data = {
          userName: `${user.firstName} ${user.lastName}`,
          otpReason: "login",
          otp,
        };
        await this.mailService.sendOtp(otpIdentifier, data);
      }
    } catch (error) {
      throwError(error);
    }
  }
  async generateOtpAndSave(body: SendOtpBody) {
    try {
      const { otpIdentifier, otpReason, otpType } = body;
      let otp = generateOtp();

      if (otpType === "EMAIL") {
        const testEmailData = await getConstant("TEST_EMAIL_DATA");
        const testEmails = (testEmailData?.emails as string[]) ?? [];
        const testotp = (testEmailData?.otp as string) ?? "1234";
        if (testEmails.includes(otpIdentifier)) otp = testotp;
      }
      await this.repository.saveOtp({
        otp,
        otpIdentifier,
        otpReason,
        otpType,
      });
      return otp;
    } catch (error) {
      throwError(error);
    }
  }
}
export default OtpHelper;
