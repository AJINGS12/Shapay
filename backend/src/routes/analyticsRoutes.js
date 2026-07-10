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

    const paymentList = Array.isArray(payments) ? payments : [];
    const subscriptionList = Array.isArray(subscriptions) ? subscriptions : [];

    const successfulPayments = paymentList.filter(
      (payment) => payment.status === "paid"
    );

    const failedPayments = paymentList.filter(
      (payment) => payment.status === "failed"
    );

    const pendingPayments = paymentList.filter(
      (payment) => payment.status === "pending"
    );

    const activeSubscriptions = subscriptionList.filter(
      (subscription) => subscription.status === "active"
    );

    const pausedSubscriptions = subscriptionList.filter(
      (subscription) => subscription.status === "paused"
    );

    const cancelledSubscriptions = subscriptionList.filter(
      (subscription) => subscription.status === "cancelled"
    );

    const totalRevenue = successfulPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const monthlyRecurringRevenue = activeSubscriptions.reduce(
      (sum, subscription) => sum + Number(subscription.amount || 0),
      0
    );

    // Build a 14-day revenue trend from successful payments
    const daysToShow = 14;
    const dayBuckets = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dayBuckets.push(date);
    }

    const revenueData = dayBuckets.map((bucketDate) => {
      const nextDay = new Date(bucketDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayRevenue = successfulPayments
        .filter((payment) => {
          const paidDate = new Date(payment.createdAt);
          return paidDate >= bucketDate && paidDate < nextDay;
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      return {
        day: bucketDate.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
        revenue: dayRevenue,
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalPayments: paymentList.length,
        successfulPayments: successfulPayments.length,
        failedPayments: failedPayments.length,
        pendingPayments: pendingPayments.length,
        activeSubscriptions: activeSubscriptions.length,
        pausedSubscriptions: pausedSubscriptions.length,
        cancelledSubscriptions: cancelledSubscriptions.length,
        totalRevenue,
        monthlyRecurringRevenue,
      },
      revenueData,
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