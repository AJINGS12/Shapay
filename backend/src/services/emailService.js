const { Resend } = require("resend");
const recoveryEmailTemplate = require("../templates/recoveryEmailTemplate");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRecoveryEmail = async ({
  to,
  message,
  merchantName = "Shapay",
  retryLink,
}) => {
  try {
    const html = recoveryEmailTemplate({
      merchantName,
      logoUrl: `${process.env.FRONTEND_BASE_URL}/shapay-logo.png`,
      message,
      retryLink: retryLink || `${process.env.FRONTEND_BASE_URL}/payments`,
    });

    const { data, error } = await resend.emails.send({
      from: "Shapay <onboarding@resend.dev>",
      to,
      subject: "There was an issue with your recent payment",
      html,
    });

    if (error) {
      console.log("Email send error:", error.message || error);
      return { success: false, error: error.message || error };
    }

    console.log("Recovery email sent:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.log("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendRecoveryEmail };