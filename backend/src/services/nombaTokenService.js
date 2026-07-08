const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

const getSavedCardToken = async (orderReference) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${process.env.NOMBA_BASE_URL}/v1/checkout/user-card/${orderReference}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("SAVED CARD RESPONSE:", JSON.stringify(response.data, null, 2));

    const cards = response.data?.data?.tokenizedCardData || [];
    return cards[0] || null;
  } catch (error) {
    console.log("Get Saved Card Error");
    if (error.response) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
    return null;
  }
};

const chargeTokenizedCard = async ({
  orderReference,
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
        customerEmail,
        callbackUrl: process.env.APP_CALLBACK_URL,
        amount: Number(amount),
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

module.exports = { getSavedCardToken, chargeTokenizedCard };