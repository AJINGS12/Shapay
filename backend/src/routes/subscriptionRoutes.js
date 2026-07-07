const express = require("express");

const {
  saveSubscription,
  getSubscriptions,
} = require("../database/subscriptionStore");

const {
  initializePayment,
} = require("../services/nombaCheckoutService");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      planName,
      amount,
      interval,
    } = req.body;

    const subscriptionId = `sub_${Date.now()}`;

    const subscription = {
      subscriptionId,
      customerEmail,
      customerName,
      planName,
      amount,
      interval,
      status: "pending",
      createdAt: new Date(),
      nextBillingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
    };

    const payment = await initializePayment({
      amount,
      customerName,
      customerEmail,
      merchantTxRef: subscriptionId,
    });

    subscription.checkoutLink =
      payment.data.checkoutLink;

    subscription.orderReference =
      payment.data.orderReference;

    await saveSubscription(subscription);

    res.status(201).json({
      success: true,
      subscription,
      checkoutLink: payment.data.checkoutLink,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const subscriptions = await getSubscriptions();

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;