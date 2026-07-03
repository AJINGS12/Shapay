const express = require("express");
const crypto = require("crypto");

const {
  updatePaymentStatus,
  getPayment,
} = require("../database/paymentStore");

const {
  updateSubscription,
} = require("../database/subscriptionStore");

const router = express.Router();

router.post("/nomba", (req, res) => {
  try {
    const payload = req.body;

    const signature = req.headers["nomba-signature"];
    const timestamp = req.headers["nomba-timestamp"];

    const secret = process.env.NOMBA_WEBHOOK_SECRET;

    const transaction = payload.data?.transaction || {};
    const merchant = payload.data?.merchant || {};

    const hashingPayload = [
      payload.event_type,
      payload.requestId,
      merchant.userId,
      merchant.walletId,
      transaction.transactionId,
      transaction.type,
      transaction.time,
      transaction.responseCode || "",
      timestamp,
    ].join(":");

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(hashingPayload)
      .digest("base64");

    if (generatedSignature !== signature) {
      console.log("Invalid webhook signature");

      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    console.log("Verified Nomba webhook received");
    console.log(payload);

    switch (payload.event_type) {
      case "payment_success":
        console.log("Payment successful");

        const orderReference =
          transaction.aliasAccountReference;

        const existingPayment =
          getPayment(orderReference);

        if (!existingPayment) {
          console.log("Payment record not found");
          break;
        }

        if (existingPayment.status === "paid") {
          console.log("Duplicate webhook ignored");
          break;
        }

        updatePaymentStatus(orderReference, "paid");

        console.log("Payment status updated to PAID");

        if (orderReference.startsWith("sub_")) {
          updateSubscription(orderReference, {
            status: "active",
            activatedAt: new Date(),
          });

          console.log("Subscription activated");
        }

        break;

      case "payment_failed":
        console.log("Payment failed");

        break;

      default:
        console.log(
          "Unhandled event:",
          payload.event_type
        );
    }

    return res.status(200).json({
      success: true,
      message: "Webhook verified",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;