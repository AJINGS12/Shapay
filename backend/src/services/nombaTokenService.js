const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

const getSavedCardByEmail = async (customerEmail) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${process.env.NOMBA_BASE_URL}/v1/checkout/tokenized-card-data`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        },
      }
    );

    console.log("TOKENIZED CARD LIST RESPONSE:", JSON.stringify(response.data, null, 2));

    const cards = response.data?.data?.tokenizedCardDataList || [];

    const match = cards.find(
      (card) => card.customerEmail?.toLowerCase() === customerEmail?.toLowerCase()
    );

    return match || null;
  } catch (error) {
    console.log("Get Tokenized Card Data Error");
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

module.exports = { getSavedCardByEmail, chargeTokenizedCard };