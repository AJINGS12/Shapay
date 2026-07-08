const express = require("express");
const crypto = require("crypto");

const {
  updatePaymentStatus,
  getPayment,
} = require("../database/paymentStore");

const {
  updateSubscription,
} = require("../database/subscriptionStore");

const {
  generateRecoveryMessage,
} = require("../services/claudeService");

const {
  sendRecoveryEmail,
} = require("../services/emailService");

const router = express.Router();

// Simple in-memory idempotency guard (per official docs: reject duplicate requestId).
// Note: resets on server restart — fine for hackathon demo, would use a DB table in production.
const processedRequestIds = new Set();

const getPaymentReferenceCandidates = (payload) => {
  const transaction = payload.data?.transaction || {};
  const data = payload.data || {};

  return [
    payload.merchantTxRef,
    payload.orderReference,
    payload.reference,
    transaction.merchantTxRef,
    transaction.aliasAccountReference,
    transaction.orderReference,
    data.orderReference,
    data.merchantTxRef,
    data.aliasAccountReference,
    data.reference,
    payload.requestId,
  ].filter(Boolean);
};

const findMatchedPayment = async (payload) => {
  const paymentReferences = getPaymentReferenceCandidates(payload);

  for (const reference of paymentReferences) {
    const existingPayment = await getPayment(reference);
    if (existingPayment) {
      return { matchedPayment: existingPayment, matchedReference: reference };
    }
  }

  return { matchedPayment: null, matchedReference: null };
};

router.post(
  "/nomba",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const rawBody = req.body; // Buffer, thanks to express.raw()
      const signature = req.header("nomba-signature");
      const secret = process.env.NOMBA_WEBHOOK_SECRET;

      if (!secret) {
        console.log("Missing NOMBA_WEBHOOK_SECRET");
        return res.status(500).json({
          success: false,
          message: "Webhook secret is not configured",
        });
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      console.log("Signature check:", {
        expectedSignature,
        receivedSignature: signature,
      });

      if (signature !== expectedSignature) {
        console.log("Invalid webhook signature");
        return res.status(401).json({
          success: false,
          message: "Invalid signature",
        });
      }

      const payload = JSON.parse(rawBody.toString());

      console.log("Webhook hit (signature verified)");
      console.log(JSON.stringify(payload, null, 2));

      // Idempotency: ignore if we've already processed this requestId
      if (payload.requestId) {
        if (processedRequestIds.has(payload.requestId)) {
          console.log("Duplicate webhook requestId ignored:", payload.requestId);
          return res.status(200).json({
            success: true,
            message: "Already processed",
          });
        }
        processedRequestIds.add(payload.requestId);
      }

      const transaction = payload.data?.transaction || {};
      const customerEmail =
        transaction.customerEmail ||
        transaction.customer_email ||
        payload.customerEmail ||
        payload.customer_email ||
        null;
      const amount = transaction.amount || payload.amount || null;

      switch (payload.event_type) {
        case "payment_success": {
          console.log("Payment successful");

          const { matchedPayment, matchedReference } = await findMatchedPayment(payload);

          if (!matchedPayment && !matchedReference) {
            console.log(
              "Payment record not found for refs:",
              getPaymentReferenceCandidates(payload)
            );
          }

          if (matchedPayment?.status === "paid") {
            console.log("Duplicate webhook ignored (already paid)");
            break;
          }

          const updatedPayment = await updatePaymentStatus(
            matchedReference || null,
            "paid",
            { customerEmail, amount }
          );

          console.log("Payment status updated to PAID", {
            matchedReference,
            updatedPayment,
          });

          if (
            matchedReference &&
            typeof matchedReference === "string" &&
            matchedReference.startsWith("sub_")
          ) {
            await updateSubscription(matchedReference, {
              status: "active",
              activatedAt: new Date(),
            });

            console.log("Subscription activated");
          }

          break;
        }

        case "payment_failed": {
          console.log("Payment failed");

          const { matchedReference, matchedPayment } = await findMatchedPayment(payload);

          const updatedPayment = await updatePaymentStatus(
            matchedReference || null,
            "failed",
            { customerEmail, amount }
          );

          console.log("Payment status updated to FAILED", {
            matchedReference,
            updatedPayment,
          });

          try {
            const recipientEmail =
              customerEmail ||
              matchedPayment?.customerEmail ||
              matchedPayment?.customer_email;

            if (recipientEmail) {
              const recoveryMessage = await generateRecoveryMessage({
                customerName:
                  matchedPayment?.customerName ||
                  matchedPayment?.customer_name ||
                  "Customer",
                amount: amount || matchedPayment?.amount || 0,
                reason: transaction.responseCode || "Payment declined",
                planName:
                  matchedPayment?.planName ||
                  matchedPayment?.plan_name ||
                  "your subscription",
                merchantName: "Shapay",
              });

              const emailResult = await sendRecoveryEmail({
                to: recipientEmail,
                message: recoveryMessage,
                merchantName: "Shapay",
                retryLink: `${process.env.FRONTEND_BASE_URL}/payments`,
              });

              console.log("Recovery email flow completed", {
                recipientEmail,
                emailSent: emailResult.success,
              });
            }
          } catch (recoveryError) {
            console.log("Recovery message/email error:", recoveryError.message);
          }

          break;
        }

        default:
          console.log("Unhandled event:", payload.event_type);
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
  }
);

module.exports = router;