const crypto = require("crypto");

const verifySignature = (payload, signature, timestamp) => {
  const secret = process.env.NOMBA_WEBHOOK_SECRET;

  const parsedBody = JSON.parse(payload);

  const transaction = parsedBody.data.transaction;
  const merchant = parsedBody.data.merchant;

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

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(hashingPayload)
    .digest("base64");

  return generatedSignature === signature;
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["nomba-signature"];
    const timestamp = req.headers["nomba-timestamp"];

    const rawBody = JSON.stringify(req.body);

    const isValid = verifySignature(
      rawBody,
      signature,
      timestamp
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = req.body;

    console.log("Webhook Received:");
    console.log(event);

    if (event.event_type === "payment_success") {
      console.log("Payment successful");
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Webhook Error");
    console.log(error.message);

    res.status(500).json({
      success: false,
    });
  }
};

module.exports = {
  handleWebhook,
};