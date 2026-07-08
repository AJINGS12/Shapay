const express = require("express");

const {
  saveSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
} = require("../database/subscriptionStore");

const {
  initializePayment,
} = require("../services/nombaCheckoutService");

const {
  chargeTokenizedCard,
} = require("../services/nombaTokenService");

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
      tokenizeCard: true,
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

router.get("/:subscriptionId", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
    });
  }
});

router.post("/:subscriptionId/renew", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (!subscription.card_token) {
      return res.status(400).json({
        success: false,
        message: "No saved card token for this subscription yet",
      });
    }

    const renewalRef = `${subscriptionId}_renewal_${Date.now()}`;

    const chargeResult = await chargeTokenizedCard({
      orderReference: renewalRef,
      customerEmail: subscription.customerEmail,
      amount: subscription.amount,
      tokenKey: subscription.card_token,
    });

    const success = chargeResult?.data?.status === true;

    if (success) {
      const nextBillingDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );

      await updateSubscription(subscriptionId, {
        next_billing_date: nextBillingDate,
        last_renewed_at: new Date(),
      });
    }

    res.json({
      success,
      message: success
        ? "Subscription renewed"
        : "Renewal failed",
      raw: chargeResult,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Renewal failed",
    });
  }
});

module.exports = router;