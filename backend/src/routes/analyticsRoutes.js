const express = require("express");

const {
  getAllPayments,
} = require("../database/paymentStore");

const {
  getAllSubscriptions,
} = require("../database/subscriptionStore");

const router = express.Router();

router.get("/overview", (req, res) => {
  try {
    const payments = getAllPayments();

    const subscriptions =
      getAllSubscriptions();

    const successfulPayments =
      payments.filter(
        (payment) => payment.status === "paid"
      );

    const failedPayments = payments.filter(
      (payment) => payment.status === "failed"
    );

    const activeSubscriptions =
      subscriptions.filter(
        (subscription) =>
          subscription.status === "active"
      );

    const totalRevenue =
      successfulPayments.reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const monthlyRecurringRevenue =
      activeSubscriptions.reduce(
        (sum, subscription) =>
          sum + Number(subscription.amount || 0),
        0
      );

    res.status(200).json({
      success: true,

      analytics: {
        totalPayments: payments.length,

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