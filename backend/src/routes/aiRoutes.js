const express = require("express");

const router = express.Router();

const {
  generateRetryRecommendation,
} = require("../services/retryIntelligenceService");

const {
  getPayments,
} = require("../database/paymentStore");

const {
  requireMerchant,
} = require("../middleware/merchantContext");

router.use(requireMerchant);

router.get(
  "/ai/retry-recommendations",
  async (req, res) => {
    try {
      const payments = await getPayments(req.merchantId);

      const failedPayments = payments
        .filter((payment) => payment.status === "failed")
        .slice(0, 5); // limit to most recent 5 failed payments to avoid excessive Claude calls

      if (failedPayments.length === 0) {
        return res.status(200).json({
          success: true,
          recommendations: [],
        });
      }

      const recommendations = await Promise.all(
        failedPayments.map(async (payment) => {
          const aiRecommendation = await generateRetryRecommendation({
            customerName: payment.customerName || "Customer",
            amount: payment.amount,
            reason: "Insufficient Funds",
            previousFailures: 1,
          });

          return {
            customer: payment.customerName || "Customer",
            retryDelay: `${aiRecommendation.retryDelayHours} Hours`,
            reasoning: aiRecommendation.reasoning,
          };
        })
      );

      res.status(200).json({
        success: true,
        recommendations,
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