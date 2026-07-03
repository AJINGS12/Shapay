const axios = require("axios");

const { getAccessToken } = require("./nombaAuthService");

const initializePayment = async ({
  amount,
  customerName,
  customerEmail,
  merchantTxRef,
}) => {
  try {
    const accessToken = await getAccessToken();

    const payload = {
      order: {
        amount,
        currency: "NGN",
        customerName,
        customerEmail,
        merchantTxRef,
        callbackUrl: process.env.APP_CALLBACK_URL,
      },
    };

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
    console.log("Checkout Initialization Error");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    throw error;
  }
};

module.exports = {
  initializePayment,
};