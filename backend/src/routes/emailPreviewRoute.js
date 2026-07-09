const express = require("express");

const router = express.Router();

const {
  generateRecoveryMessage,
} = require("../services/claudeService");

const recoveryEmailTemplate =
  require("../templates/recoveryEmailTemplate");

router.get(
  "/test-recovery-email",
  async (req, res) => {
    try {
      const message =
        await generateRecoveryMessage({
          customerName: "Ismail",
          amount: 5000,
          reason:
            "Insufficient Funds",
          planName: "Pro Plan",
          merchantName:
            "Shapay",
        });

      const html =
        recoveryEmailTemplate({
          merchantName:
            "Shapay",
          logoUrl:
           `${process.env.FRONTEND_BASE_URL}/shapay-logo.png`,
          message,
          retryLink:
            "https://shapay.ai/retry",
        });

      res.send(html);
    } catch (error) {
      console.log(error);

      res
        .status(500)
        .send(
          "Failed to generate email"
        );
    }
  }
);

module.exports = router;