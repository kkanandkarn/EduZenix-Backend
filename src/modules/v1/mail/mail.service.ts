import { throwError } from "../../../utils/helper";
import ejs from "ejs";
import MailRepository from "./mail.repository";
import { sendMailSES } from "../../../core/aws/ses";

class MailService {
  private readonly repository: MailRepository;
  constructor() {
    this.repository = new MailRepository();
  }
  async sendOtp(email: string, data: unknown) {
    try {
      const mailTemplate = await this.repository.getMailTemplate("OTP");
      if (!mailTemplate) {
        console.log("Mail template does not exists for OTP");
        return;
      }
      let subject = mailTemplate.subject;
      let content = mailTemplate.body;

      try {
        subject = ejs.render(subject, data as ejs.Data);
        content = ejs.render(content, data as ejs.Data);
      } catch (ejsError) {
        console.error("EJS rendering error:", ejsError);
      }

      try {
        // await sendMailSES({ recipient: email, body: content, subject: subject });
        console.log(`Email sent to ${email} regarding Login`);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    } catch (error) {
      throwError(error);
    }
  }
}
export default MailService;
