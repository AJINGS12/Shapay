const crypto = require("crypto");

const {
  generateRecoveryMessage,
} = require("../services/claudeService");

const recoveryEmailTemplate =
  require("../templates/recoveryEmailTemplate");

const { updatePaymentStatus, createActivity } = require(
  "../database/paymentStore"
);

const verifySignature = (
  payload,
  signature,
  timestamp
) => {
  const secret =
    process.env.NOMBA_WEBHOOK_SECRET;

  const parsedBody =
    JSON.parse(payload);

  const transaction =
    parsedBody.data.transaction;

  const merchant =
    parsedBody.data.merchant;

  const hashingPayload = [
    parsedBody.event_type,
    parsedBody.requestId,
    merchant.userId,
    merchant.walletId,
    transaction.transactionId,
    transaction.type,
    transaction.time,
    transaction.responseCode || "",
    timestamp,
  ].join(":");

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(hashingPayload)
      .digest("base64");

  return (
    generatedSignature === signature
  );
};

const handleWebhook = async (
  req,
  res
) => {
  try {
    console.log("Webhook hit");
    console.log(
      JSON.stringify(req.body, null, 2)
    );

    const event = req.body;

    const signature =
      req.headers[
        "nomba-signature"
      ];

    const timestamp =
      req.headers[
        "nomba-timestamp"
      ];

    const rawBody =
      JSON.stringify(req.body);

    const isValid =
      verifySignature(
        rawBody,
        signature,
        timestamp
      );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid webhook signature",
      });
    }

    console.log(
      "\nWebhook Received:"
    );

    // PAYMENT SUCCESS

    if (
      event.event_type ===
      "payment_success"
    ) {
      console.log(
        "Payment successful"
      );
      const transaction =
        event.data.transaction;

      const merchantTxRef =
        transaction.merchantTxRef ||
        transaction.merchantTxRef;

      try {
        await updatePaymentStatus(
        event.data.orderReference,
        "paid"
        );
      
        
        

        await createActivity({
          type: "payment",
          status: "paid",
          customer_name:
            transaction.customerName || null,
          amount: transaction.amount || 0,
          created_at: new Date(),
          order_reference: merchantTxRef,
        });
      } catch (err) {
        console.log(
          "Error updating payment status or creating activity",
          err
        );
      }
    }

    // PAYMENT FAILED

    if (
      event.event_type ===
      "payment_failed"
    ) {
      console.log(
        "Payment failed"
      );

      const transaction =
        event.data.transaction;

      const customerName =
        transaction.customerName ||
        "Customer";

      const amount =
        transaction.amount || 0;

      const message =
        await generateRecoveryMessage({
          customerName,
          amount,
          reason:
            "Insufficient Funds",
          planName:
            "Pro Plan",
          merchantName:
            "Shapay",
        });

      const recoveryEmail =
        recoveryEmailTemplate({
          merchantName:
            "Shapay",

          logoUrl:
            "http://localhost:3000/assets/logos/shapay-logo.png",

          message,

          retryLink:
            "https://shapay.ai/retry",
        });

      console.log(
        "\n=== AI RECOVERY EMAIL ===\n"
      );

      console.log(
        recoveryEmail
      );
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(
      "Webhook Error"
    );

    console.log(
      error.message
    );

    res.status(500).json({
      success: false,
    });
  }
};

module.exports = {
  handleWebhook,
};