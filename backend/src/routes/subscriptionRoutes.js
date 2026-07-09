const express = require("express");

const {
  saveSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
} = require("../database/subscriptionStore");

const {
  savePayment,
} = require("../database/paymentStore");

const {
  initializePayment,
} = require("../services/nombaCheckoutService");

const {
  chargeTokenizedCard,
} = require("../services/nombaTokenService");

const {
  requireMerchant,
} = require("../middleware/merchantContext");

const router = express.Router();

router.use(requireMerchant);

router.post("/create", async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      planName,
      amount,
      interval,
    } = req.body;

    if (!customerEmail || !customerName || !amount) {
      return res.status(400).json({
        success: false,
        message: "customerEmail, customerName, and amount are required",
      });
    }

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
      merchantId: req.merchantId,
    };

    const payment = await initializePayment({
      amount,
      customerName,
      customerEmail,
      merchantTxRef: subscriptionId,
      tokenizeCard: true,
    });

    await savePayment({
      orderReference: subscriptionId,
      merchantTxRef: subscriptionId,
      customerName,
      customerEmail,
      amount,
      status: "pending",
      merchantId: req.merchantId,
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
    const subscriptions = await getSubscriptions(req.merchantId);

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

    if (subscription.status === "cancelled") {
      return res.status(200).json({
        success: false,
        message: "This subscription is cancelled and cannot be renewed.",
      });
    }

    if (!subscription.card_token) {
      return res.status(200).json({
        success: false,
        message:
          "No saved card token available yet. Card tokenization requires an additional customer OTP consent step during checkout, which this sandbox environment does not expose in its hosted checkout UI. In production, once a customer consents to save their card, renewal charges will process automatically via Nomba's tokenized card payment API.",
      });
    }

    const customerId = `cus_${subscription.customerEmail.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}`;

    const renewalRef = `${subscriptionId}_renewal_${Date.now()}`;

    const chargeResult = await chargeTokenizedCard({
      orderReference: renewalRef,
      customerId,
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
        status: "active",
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

router.post("/:subscriptionId/cancel", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const updated = await updateSubscription(subscriptionId, {
      status: "cancelled",
      cancelled_at: new Date(),
    });

    res.json({
      success: true,
      message: "Subscription cancelled",
      subscription: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    });
  }
});

router.post("/:subscriptionId/pause", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pause a cancelled subscription",
      });
    }

    const updated = await updateSubscription(subscriptionId, {
      status: "paused",
      paused_at: new Date(),
    });

    res.json({
      success: true,
      message: "Subscription paused",
      subscription: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to pause subscription",
    });
  }
});

router.post("/:subscriptionId/resume", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getSubscription(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.status !== "paused") {
      return res.status(400).json({
        success: false,
        message: "Only paused subscriptions can be resumed",
      });
    }

    const nextBillingDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const updated = await updateSubscription(subscriptionId, {
      status: "active",
      next_billing_date: nextBillingDate,
      resumed_at: new Date(),
    });

    res.json({
      success: true,
      message: "Subscription resumed",
      subscription: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to resume subscription",
    });
  }
});

module.exports = router;