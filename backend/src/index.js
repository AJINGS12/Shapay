process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:");
  console.error(err.message);
  console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
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


// AUTH TEST
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


// TEMPORARILY DISABLED ROUTES
// const analyticsRoutes = require("./routes/analyticsRoutes");
// const reportingRoutes = require("./routes/reportingRoutes");
// const emailPreviewRoute = require("./routes/emailPreviewRoute");
// const aiRoutes = require("./routes/aiRoutes");
// const simulationRoutes = require("./routes/simulationRoutes");
// const recoveryAnalyticsRoutes = require("./routes/recoveryAnalyticsRoutes");

// app.use("/analytics", analyticsRoutes);
// app.use("/reports", reportingRoutes);
// app.use(emailPreviewRoute);
// app.use(aiRoutes);
// app.use(simulationRoutes);
// app.use(recoveryAnalyticsRoutes);


// TEMPORARILY DISABLED BILLING JOB
// const {
//   processRecurringBilling,
// } = require("./services/subscriptionBillingService");

// setInterval(() => {
//   processRecurringBilling();
// }, 60 * 1000);


// CALLBACK ROUTES
app.get("/payment/callback", (req, res) => {
  res.json({
    success: true,
    message: "Payment completed",
  });
});

app.get("/payments/callback", (req, res) => {
  res.json({
    success: true,
    message: "Payment completed",
  });
});


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
  console.log(`Server running on port ${PORT}`);
});