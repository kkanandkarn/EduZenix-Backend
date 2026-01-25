const nodemailer = require("nodemailer");
const { throwError } = require("./helper");

let transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (email, subject, html) => {
  if (process.env.NODE_ENV !== "production") {
    const isWhiteListedEmail = await checkWhitelistedEmail(email, db);
    if (!isWhiteListedEmail) {
      throw new ErrorHandler(
        UNAUTHORIZED,
        "Your email is not whitelisted. Please contract administrator",
      );
    }
  }

  let mailOptions = {
    to: email,
    from: process.env.EMAIL,
    subject: subject,
    importance: "high",
    html: html,
  };

  await transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("Message sent: %s", info?.messageId);
    console.log("Preview URL: %s", nodemailer?.getTestMessageUrl(info));
  });
  console.log("message sent sucess");
  return { success: true };
};
const checkWhitelistedEmail = async (email) => {
  try {
    // const whitelistedEmail = await db.WhitelistEmail.findUnique({
    //   where: { email: email },
    // });
    // return !!whitelistedEmail;
    return false;
  } catch (e) {
    throwError(e);
  }
};

module.exports = {
  sendMail,
};
