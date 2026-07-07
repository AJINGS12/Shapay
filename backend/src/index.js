process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:");
  console.error(err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:");
  console.error(reason);
});

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
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());


// BODY PARSER
app.use(express.json());


// ROOT
app.get("/", (req, res) => {
  res.send("Shapay API running");
});


// WEBHOOKS
const nombaWebhook = require("./webhooks/nombaWebhook");

app.use("/webhooks", nombaWebhook);
app.use("/webhook", nombaWebhook);


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

app.use("/payments", paymentRoutes);
app.use("/subscriptions", subscriptionRoutes);


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


// PAYMENT CALLBACKS
const { verifyTransaction } = require("./services/nombaVerifyService");
const { updatePaymentStatus } = require("./database/paymentStore");

const handlePaymentCallback = async (req, res) => {
  try {
    const { orderReference } = req.query;

    if (!orderReference) {
      return res.status(400).json({
        success: false,
        message: "Missing orderReference",
      });
    }

    const result = await verifyTransaction(orderReference);

    if (result.success) {
      await updatePaymentStatus(orderReference, "paid", {});
    }

    return res.json({
      success: result.success,
      message: result.success
        ? "Payment completed"
        : "Payment not yet confirmed",
    });
  } catch (error) {
    console.error(
      "CALLBACK VERIFY ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

app.get("/payment/callback", handlePaymentCallback);
app.get("/payments/callback", handlePaymentCallback);


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