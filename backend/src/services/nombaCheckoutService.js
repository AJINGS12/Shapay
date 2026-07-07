const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

const buildCheckoutPayload = ({
  amount,
  customerName,
  customerEmail,
  merchantTxRef,
}) => ({
  order: {
    orderReference: merchantTxRef,
    amount: Number(amount),
    currency: "NGN",
    customerEmail,
    customerName,
    callbackUrl: process.env.APP_CALLBACK_URL,
  },
  webhookUrl: `${process.env.BACKEND_BASE_URL}/webhooks/nomba`,
});

const initializePayment = async ({
  amount,
  customerName,
  customerEmail,
  merchantTxRef,
}) => {
  try {
    const accessToken = await getAccessToken();

    const payload = buildCheckoutPayload({
      amount,
      customerName,
      customerEmail,
      merchantTxRef,
    });

    console.log("CHECKOUT PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("NOMBA BASE URL:", process.env.NOMBA_BASE_URL);
    console.log("ACCOUNT ID:", process.env.NOMBA_PARENT_ACCOUNT_ID);

    const response = await axios.post(
      `${process.env.NOMBA_BASE_URL}/v1/checkout/order`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("CHECKOUT RESPONSE:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log("Checkout Initialization Error");
    console.log("ERROR STATUS:", error.response?.status);

    if (error.response) {
      console.log("ERROR DATA:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("ERROR MESSAGE:", error.message);
    }

    throw error;
  }
};

module.exports = {
  buildCheckoutPayload,
  initializePayment,
};