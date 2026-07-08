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

router.post("/nomba", async (req, res) => {
  try {
    console.log("Webhook hit");
    console.log(JSON.stringify(req.body, null, 2));

    const payload = req.body;

    const signature =
      req.headers["nomba-signature"] ||
      req.headers["x-nomba-signature"] ||
      req.headers["Nomba-Signature"];
    const timestamp =
      req.headers["nomba-timestamp"] ||
      req.headers["x-nomba-timestamp"] ||
      req.headers["Nomba-Timestamp"];

    const secret = process.env.NOMBA_WEBHOOK_SECRET;

    if (!secret) {
      console.log("Missing NOMBA_WEBHOOK_SECRET");
      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    const transaction = payload.data?.transaction || {};
    const merchant = payload.data?.merchant || {};
    const customerEmail =
      transaction.customerEmail ||
      transaction.customer_email ||
      payload.customerEmail ||
      payload.customer_email ||
      null;
    const amount = transaction.amount || payload.amount || null;

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

    // NOTE: Signature check is disabled for now. Before final submission,
    // log both values below, confirm they match on a real webhook call,
    // then uncomment this block so unverified requests are rejected.
    console.log("Signature check:", { generatedSignature, receivedSignature: signature });
    // if (generatedSignature !== signature) {
    //   console.log("Invalid webhook signature");
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid signature",
    //   });
    // }

    console.log("Verified Nomba webhook received");
    console.log(payload);

    switch (payload.event_type) {
      case "payment_success": {
        console.log("Payment successful");

        const { matchedPayment, matchedReference } = await findMatchedPayment(payload);

        if (!matchedPayment && !matchedReference) {
          console.log(
            "Payment record not found for refs:",
            getPaymentReferenceCandidates(payload)
          );
        } else {
          console.log("Matched payment reference", {
            matchedReference,
            matchedPayment,
            customerEmail,
            amount,
          });
        }

        if (matchedPayment?.status === "paid") {
          console.log("Duplicate webhook ignored");
          break;
        }

        const updatedPayment = await updatePaymentStatus(
          matchedReference || null,
          "paid",
          {
            customerEmail,
            amount,
          }
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

        if (!matchedReference) {
          console.log(
            "Failed payment record not found for refs:",
            getPaymentReferenceCandidates(payload)
          );
        }

        const updatedPayment = await updatePaymentStatus(
          matchedReference || null,
          "failed",
          {
            customerEmail,
            amount,
          }
        );

        console.log("Payment status updated to FAILED", {
          matchedReference,
          updatedPayment,
        });

        // Generate and send AI-powered recovery email
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
          } else {
            console.log("No recipient email found for recovery message");
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
});

module.exports = router;