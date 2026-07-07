const express = require("express");

const router = express.Router();

router.get(
  "/analytics/recovery",
  async (req, res) => {
    try {
      const metrics = {
        recoveredRevenue: 120000,

        recoveryRate: 82,

        recoveredSubscriptions: 34,

        aiRetrySuccess: 28,
      };

      res.status(200).json({
        success: true,
        metrics,
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