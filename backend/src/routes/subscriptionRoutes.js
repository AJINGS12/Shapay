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
  getSavedCards,
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

    if (!subscription.customerEmail) {
      console.log("Subscription missing customerEmail:", subscription);
      return res.status(200).json({
        success: false,
        message:
          "This subscription is missing customer email data and cannot be renewed.",
      });
    }

    const customerId = `cus_${subscription.customerEmail.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}`;

    const savedCard = await getSavedCards(customerId);

    if (!savedCard) {
      return res.status(200).json({
        success: false,
        message:
          "No saved card found for this customer yet. Card tokenization requires customer consent during checkout, which may not be available in the sandbox environment for this hackathon submission. In production, once a card is tokenized, renewal charges will process automatically using the customer's saved card.",
      });
    }

    const renewalRef = `${subscriptionId}_renewal_${Date.now()}`;

    const chargeResult = await chargeTokenizedCard({
      cardId: savedCard.cardId || savedCard.id,
      customerId,
      amount: subscription.amount,
      merchantTxRef: renewalRef,
    });

    const success =
      chargeResult?.status === true ||
      chargeResult?.data?.status === true;

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