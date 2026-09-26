import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { SendSesMailBody, SesMailOptions } from "./ses.type";
export const sendMailSES = async (payload: SendSesMailBody) => {
  const { recipient, subject, body, attachments = [], cc = [], bcc = [], senderName } = payload;

  const ses = new SESv2Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });

  const transport = nodemailer.createTransport({
    SES: { sesClient: ses, SendEmailCommand },
  });

  // Prepare mail options
  const mailOptions: SesMailOptions = {
    from: {
      name: `Team ${senderName ?? "Eduzenix"}`,
      address: process.env.SES_EMAIL!,
    },
    to: recipient,
    priority: "high",
    subject: subject,
    html: body,
  };

  // Add CC if provided
  if (cc.length) {
    // Handle both string and array
    mailOptions.cc = Array.isArray(cc) ? cc : [cc];
    // Filter out empty or invalid emails
    mailOptions.cc = mailOptions.cc.filter((email) => email && email.trim() !== "");
    // If no valid CC after filtering, remove the property
    if (mailOptions.cc.length === 0) {
      delete mailOptions.cc;
    }
  }

  // Add BCC if provided
  if (bcc) {
    mailOptions.bcc = Array.isArray(bcc) ? bcc : [bcc];
    mailOptions.bcc = mailOptions.bcc.filter((email) => email && email.trim() !== "");
    if (mailOptions.bcc.length === 0) {
      delete mailOptions.bcc;
    }
  }

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Message sent: %s", info?.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};
