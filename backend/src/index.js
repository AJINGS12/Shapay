const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Shapay API running");
});

const nombaWebhook = require("./webhooks/nombaWebhook");

app.use("/webhooks", nombaWebhook);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});