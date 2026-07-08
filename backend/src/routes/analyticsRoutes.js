const express = require("express");

const { getPayments } = require(
  "../database/paymentStore"
);

const { getSubscriptions } = require(
  "../database/subscriptionStore"
);

const {
  requireMerchant,
} = require("../middleware/merchantContext");

const router = express.Router();

router.use(requireMerchant);

router.get("/overview", async (req, res) => {
  try {
    const payments = await getPayments(req.merchantId);
    const subscriptions = await getSubscriptions(req.merchantId);

    const paymentList = Array.isArray(payments)
      ? payments
      : [];
    const subscriptionList = Array.isArray(subscriptions)
      ? subscriptions
      : [];

    const successfulPayments = paymentList.filter(
      (payment) => payment.status === "paid"
    );

    const failedPayments = paymentList.filter(
      (payment) => payment.status === "failed"
    );

    const activeSubscriptions = subscriptionList.filter(
      (subscription) =>
        subscription.status === "active"
    );

    const totalRevenue = successfulPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    const monthlyRecurringRevenue = activeSubscriptions.reduce(
      (sum, subscription) =>
        sum + Number(subscription.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      analytics: {
        totalPayments: paymentList.length,
        successfulPayments:
          successfulPayments.length,
        failedPayments:
          failedPayments.length,
        activeSubscriptions:
          activeSubscriptions.length,
        totalRevenue,
        monthlyRecurringRevenue,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
});

module.exports = router;