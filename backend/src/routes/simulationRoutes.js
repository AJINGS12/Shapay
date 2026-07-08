const express = require("express");

const router = express.Router();

const {
  generateRetryRecommendation,
} = require("../services/retryIntelligenceService");

const {
  generateRecoveryMessage,
} = require("../services/claudeService");

const {
  sendRecoveryEmail,
} = require("../services/emailService");

const {
  savePayment,
} = require("../database/paymentStore");

const {
  requireMerchant,
} = require("../middleware/merchantContext");

router.use(requireMerchant);

router.post(
  "/simulate/payment-failure",
  async (req, res) => {
    try {
      const demoEmail = req.body?.customerEmail || process.env.GMAIL_USER;
      const demoName = req.body?.customerName || "Demo Customer";
      const demoAmount = req.body?.amount || 5000;
      const demoRef = `demo_fail_${Date.now()}`;

      // Save a real failed payment record so it shows up in Payments/Activity
      await savePayment({
        orderReference: demoRef,
        merchantTxRef: demoRef,
        customerName: demoName,
        customerEmail: demoEmail,
        amount: demoAmount,
        status: "failed",
        merchantId: req.merchantId,
      });

      // Generate AI retry recommendation
      const aiRecommendation = await generateRetryRecommendation({
        customerName: demoName,
        amount: demoAmount,
        reason: "Insufficient Funds",
        previousFailures: 1,
      });

      // Generate AI recovery message and send real email
      const recoveryMessage = await generateRecoveryMessage({
        customerName: demoName,
        amount: demoAmount,
        reason: "Insufficient Funds",
        planName: "Pro Plan",
        merchantName: "Shapay",
      });

      const emailResult = await sendRecoveryEmail({
        to: demoEmail,
        message: recoveryMessage,
        merchantName: "Shapay",
        retryLink: `${process.env.FRONTEND_BASE_URL}/payments`,
      });

      res.status(200).json({
        success: true,
        message: "Failed payment simulated successfully.",
        emailSent: emailResult.success,
        recommendation: {
          customer: demoName,
          retryDelay: `${aiRecommendation.retryDelayHours} Hours`,
          reasoning: aiRecommendation.reasoning,
        },
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
      });
    }
  }
);

module.exports = router;