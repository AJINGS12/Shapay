const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

const chargeTokenizedCard = async ({
  orderReference,
  customerId,
  customerEmail,
  amount,
  tokenKey,
}) => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${process.env.NOMBA_BASE_URL}/v1/checkout/tokenized-card-payment`,
    {
      order: {
        orderReference,
        customerId,
        callbackUrl: process.env.APP_CALLBACK_URL,
        customerEmail,
        amount: String(amount),
        currency: "NGN",
      },
      tokenKey,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("TOKENIZED CHARGE RESPONSE:", JSON.stringify(response.data, null, 2));

  return response.data;
};

module.exports = { chargeTokenizedCard };