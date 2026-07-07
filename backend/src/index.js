require("dotenv").config(); // 👈 MUST be first

const emailPreviewRoute =
  require("./routes/emailPreviewRoute");

const aiRoutes =
  require("./routes/aiRoutes");

const simulationRoutes =
  require("./routes/simulationRoutes");

const recoveryAnalyticsRoutes =
  require(
    "./routes/recoveryAnalyticsRoutes"
  );


const express = require("express");
const axios = require("axios");
// other imports...const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Shapay API running");
});

const nombaWebhook = require("./webhooks/nombaWebhook");

app.use("/webhooks", nombaWebhook);
app.use("/webhook", nombaWebhook);

const PORT = 5000;

const { getAccessToken } = require("./services/nombaAuthService");

app.get("/test-token", async (req, res) => {
  try {
    const token = await getAccessToken();

    res.json({
      success: true,
      message: "Nomba authentication successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
});

const {
  processRecurringBilling,
} = require("./services/subscriptionBillingService");

const paymentRoutes = require("./routes/paymentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportingRoutes = require("./routes/reportingRoutes");

app.use("/payments", paymentRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/reports", reportingRoutes);
app.use(emailPreviewRoute);
app.use(aiRoutes);
app.use(simulationRoutes);
app.use(
  recoveryAnalyticsRoutes
);

setInterval(() => {
  processRecurringBilling();
}, 60 * 1000);

app.get("/payment/callback", (req, res) => {
  res.redirect("http://localhost:3000/payments/callback");
});

app.get("/payments/callback", (req, res) => {
  res.redirect("http://localhost:3000/payments/callback");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
