const express = require("express");

const router = express.Router();

const {
  generateRetryRecommendation,
} = require("../services/retryIntelligenceService");

router.post(
  "/simulate/payment-failure",
  async (req, res) => {
    try {
      const aiRecommendation =
        await generateRetryRecommendation({
          customerName: "Demo Customer",
          amount: 5000,
          reason:
            "Insufficient Funds",
          previousFailures: 1,
        });

      res.status(200).json({
        success: true,

        message:
          "Failed payment simulated successfully.",

        recommendation: {
          customer:
            "Demo Customer",

          retryDelay: `${aiRecommendation.retryDelayHours} Hours`,

          reasoning:
            aiRecommendation.reasoning,
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