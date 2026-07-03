const express = require("express");

const {
  getAllPayments,
} = require("../database/paymentStore");

const {
  getAllSubscriptions,
} = require("../database/subscriptionStore");

const router = express.Router();

router.get("/payments", (req, res) => {
  try {
    const payments = getAllPayments();

    const sortedPayments = payments.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      total: sortedPayments.length,
      payments: sortedPayments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to load payments",
    });
  }
});

router.get("/subscriptions", (req, res) => {
  try {
    const subscriptions =
      getAllSubscriptions();

    const sortedSubscriptions =
      subscriptions.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

    res.status(200).json({
      success: true,
      total: sortedSubscriptions.length,
      subscriptions:
        sortedSubscriptions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to load subscriptions",
    });
  }
});

router.get("/activity", (req, res) => {
  try {
    const payments = getAllPayments();

    const subscriptions =
      getAllSubscriptions();

    const paymentActivities =
      payments.map((payment) => ({
        type: "payment",
        status: payment.status,
        customerName:
          payment.customerName,
        amount: payment.amount,
        createdAt: payment.createdAt,
      }));

    const subscriptionActivities =
      subscriptions.map(
        (subscription) => ({
          type: "subscription",
          status: subscription.status,
          customerName:
            subscription.customerName,
          amount: subscription.amount,
          createdAt:
            subscription.createdAt,
        })
      );

    const activities = [
      ...paymentActivities,
      ...subscriptionActivities,
    ];

    activities.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      total: activities.length,
      activities,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to load activity feed",
    });
  }
});

module.exports = router;