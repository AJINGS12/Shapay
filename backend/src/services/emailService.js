const nodemailer = require("nodemailer");
const recoveryEmailTemplate = require("../templates/recoveryEmailTemplate");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // force IPv4 to avoid Railway's IPv6 routing issue
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendRecoveryEmail = async ({
  to,
  message,
  merchantName = "Shapay",
  retryLink,
}) => {
  try {
    const html = recoveryEmailTemplate({
      merchantName,
      logoUrl: `${process.env.FRONTEND_BASE_URL}/assets/logos/shapay-logo.png`,
      message,
      retryLink: retryLink || `${process.env.FRONTEND_BASE_URL}/payments`,
    });

    const info = await transporter.sendMail({
      from: `"${merchantName}" <${process.env.GMAIL_USER}>`,
      to,
      subject: "There was an issue with your recent payment",
      html,
    });

    console.log("Recovery email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRecoveryEmail };