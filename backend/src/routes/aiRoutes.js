const express = require("express");

const router = express.Router();

const {
  generateRetryRecommendation,
} = require("../services/retryIntelligenceService");

router.get(
  "/ai/retry-recommendations",
  async (req, res) => {
    try {
      const aiRecommendation =
        await generateRetryRecommendation({
          customerName: "Ismail",
          amount: 5000,
          reason:
            "Insufficient Funds",
          previousFailures: 1,
        });

      const recommendations = [
        {
          customer: "Ismail",
          retryDelay: `${aiRecommendation.retryDelayHours} Hours`,
          reasoning:
            aiRecommendation.reasoning,
        },
      ];

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