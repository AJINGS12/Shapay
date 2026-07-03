const express = require("express");

const { savePayment } = require("../database/paymentStore");

const router = express.Router();

const {
  initializePayment,
} = require("../services/nombaCheckoutService");

router.post("/initialize", async (req, res) => {
  try {
    const { amount, customerName, customerEmail } = req.body;

    const merchantTxRef = `shapay_${Date.now()}`;

    const payment = await initializePayment({
      amount,
      customerName,
      customerEmail,
      merchantTxRef,
    });

    savePayment({
      orderReference: payment.data.orderReference,
      amount,
      customerName,
      customerEmail,
      status: "pending",
      createdAt: new Date(),
   });

    res.status(200).json({
  success: true,
  checkoutLink: payment.data.checkoutLink,
  orderReference: payment.data.orderReference,
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
});

module.exports = router;