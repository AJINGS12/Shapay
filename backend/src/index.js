require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const emailPreviewRoute = require("./routes/emailPreviewRoute");
const aiRoutes = require("./routes/aiRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const recoveryAnalyticsRoutes = require("./routes/recoveryAnalyticsRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Shapay API running");
});

const nombaWebhook = require("./webhooks/nombaWebhook");
app.use("/webhooks", nombaWebhook);
app.use("/webhook", nombaWebhook);

const { getAccessToken } = require("./services/nombaAuthService");

app.get("/test-token", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ success: true, message: "Nomba authentication successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate token" });
  }
});

const { processRecurringBilling } = require("./services/subscriptionBillingService");
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
app.use(recoveryAnalyticsRoutes);

setInterval(() => {
  processRecurringBilling();
}, 60 * 1000);

app.get("/payment/callback", (req, res) => {
  res.json({ success: true, message: "Payment completed" });
});

app.get("/payments/callback", (req, res) => {
  res.json({ success: true, message: "Payment completed" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});