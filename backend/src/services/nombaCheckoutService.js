const axios = require("axios");

const { getAccessToken } = require("./nombaAuthService");

const buildCheckoutPayload = ({
  amount,
  customerName,
  customerEmail,
  merchantTxRef,
}) => ({
  order: {
    amount,
    currency: "NGN",
    customerName,
    customerEmail,
    merchantTxRef,
    callbackUrl: process.env.APP_CALLBACK_URL,
    webhookUrl: `${process.env.BACKEND_BASE_URL || "http://localhost:5000"}/webhook/nomba`,
  },
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

    console.log("Order payload:", payload);

    const response = await axios.post(
      "https://sandbox.nomba.com/v1/checkout/order",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(
      "Checkout Initialization Error"
    );

    if (error.response) {
      console.log(
        JSON.stringify(
          error.response.data,
          null,
          2
        )
      );
    } else {
      console.log(error.message);
    }

    throw error;
  }
};

module.exports = {
  buildCheckoutPayload,
  initializePayment,
};