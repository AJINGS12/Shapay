const express = require("express");

const router = express.Router();

const {
  savePayment,
} = require("../database/paymentStore");

const {
  initializePayment,
} = require("../services/nombaCheckoutService");

const createCheckoutHandler = async (req, res) => {
  try {
    const {
      amount,
      customerName,
      email,
      customerEmail,
    } = req.body;

    const recipientEmail = email || customerEmail;

    const merchantTxRef = `shapay_${Date.now()}`;

    const payment = await initializePayment({
      amount,
      customerName,
      customerEmail: recipientEmail,
      merchantTxRef,
    });

    savePayment({
      orderReference: merchantTxRef,
      merchantTxRef,
      amount,
      customerName,
      customerEmail: recipientEmail,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      checkoutLink: payment.data.checkoutLink,
      orderReference: payment.data.orderReference,
      merchantTxRef,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
    });
  }
};

router.post("/create-checkout", createCheckoutHandler);
router.post("/initialize", createCheckoutHandler);

module.exports = router;