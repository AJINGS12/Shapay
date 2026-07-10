process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:");
  console.error(err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:");
  console.error(reason);
});

require("dns").setDefaultResultOrder("ipv4first");

require("dotenv").config();

console.log("NOMBA ENV CHECK:", {
  NOMBA_BASE_URL: process.env.NOMBA_BASE_URL,
  CLIENT_ID_EXISTS: !!process.env.NOMBA_CLIENT_ID,
  CLIENT_SECRET_EXISTS: !!process.env.NOMBA_CLIENT_SECRET,
  PARENT_ACCOUNT_EXISTS: !!process.env.NOMBA_PARENT_ACCOUNT_ID,
});

const express = require("express");
const cors = require("cors");

const app = express();


// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-merchant-id"],
  })
);

app.options("*", cors());


// WEBHOOKS
// IMPORTANT: mounted BEFORE express.json(), because signature verification
// needs the raw request body, not the parsed JSON object.
const nombaWebhook = require("./webhooks/nombaWebhook");

app.use("/webhooks", nombaWebhook);
app.use("/webhook", nombaWebhook);


// BODY PARSER (for all routes below this point)
app.use(express.json());


// ROOT
app.get("/", (req, res) => {
  res.send("Shapay API running");
});


// PAYMENT CALLBACKS
// IMPORTANT: registered BEFORE app.use("/payments", paymentRoutes) below.
// Nomba's browser redirect back to this URL never carries the x-merchant-id
// header, so if paymentRoutes (with its requireMerchant middleware) were
// registered first, Express would match it first and block this callback
// with a 401 before it ever reached this handler.
const { verifyTransaction } = require("./services/nombaVerifyService");
const { updatePaymentStatus } = require("./database/paymentStore");
const { updateSubscription } = require("./database/subscriptionStore");

const handlePaymentCallback = async (req, res) => {
  console.log("CALLBACK HANDLER ENTERED", req.query);

  try {
    const { orderReference } = req.query;

    if (!orderReference) {
      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/?payment=error`
      );
    }

    const result = await verifyTransaction(orderReference);

    if (result.success) {
      await updatePaymentStatus(orderReference, "paid", {});

      if (orderReference.startsWith("sub_")) {
        const possibleToken =
          result.raw?.data?.tokenKey ||
          result.raw?.data?.cardToken ||
          null;

        await updateSubscription(orderReference, {
          status: "active",
          activated_at: new Date(),
          ...(possibleToken ? { card_token: possibleToken } : {}),
        });

        console.log("Subscription activated:", {
          orderReference,
          tokenCaptured: !!possibleToken,
        });
      }

      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/?payment=success`
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_BASE_URL}/?payment=pending`
    );
  } catch (error) {
    console.error(
      "CALLBACK VERIFY ERROR:",
      error.response?.data || error.message
    );

    return res.redirect(
      `${process.env.FRONTEND_BASE_URL}/?payment=error`
    );
  }
};

app.get("/payment/callback", handlePaymentCallback);
app.get("/payments/callback", handlePaymentCallback);


// Nomba Auth Test
const { getAccessToken } = require("./services/nombaAuthService");

app.get("/test-token", async (req, res) => {
  try {
    const token = await getAccessToken();

    res.json({
      success: true,
      message: "Nomba authentication successful",
      tokenExists: !!token,
    });

  } catch (error) {

    console.error("TEST TOKEN ERROR:");

    if (error.response) {
      console.error(
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error(error.message);
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
});


// ROUTES

const paymentRoutes = require("./routes/paymentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const emailPreviewRoute = require("./routes/emailPreviewRoute");
const reportingRoutes = require("./routes/reportingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const recoveryAnalyticsRoutes = require("./routes/recoveryAnalyticsRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const merchantRoutes = require("./routes/merchantRoutes");


app.use("/payments", paymentRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/email", emailPreviewRoute);
app.use("/reports", reportingRoutes);
app.use("/", aiRoutes);
app.use("/", recoveryAnalyticsRoutes);
app.use("/", simulationRoutes);
app.use("/merchant", merchantRoutes);



// ANALYTICS ROUTE
// Try loading real analytics route
try {

  const analyticsRoutes = require("./routes/analyticsRoutes");

  app.use("/analytics", analyticsRoutes);

  console.log("Analytics routes loaded");

} catch (error) {

  console.log(
    "Analytics routes not found, using fallback"
  );

  // Temporary dashboard fallback
  app.get("/analytics/overview", (req, res) => {

    res.json({
      success: true,
      data: {
        totalTransactions: 0,
        totalVolume: 0,
        successRate: 100,
        message: "Analytics service ready"
      }
    });

  });
}


// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {

  console.error("GLOBAL ERROR:");
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });

});


// SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});