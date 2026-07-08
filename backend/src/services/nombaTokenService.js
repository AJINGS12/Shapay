const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

// Per official Nomba docs: GET /tokenized-card/list returns saved tokens for a customer
const getSavedCards = async (customerId) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${process.env.NOMBA_BASE_URL}/v1/tokenized-card/list`,
      {
        params: { customerId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        },
      }
    );

    console.log("SAVED CARDS RESPONSE:", JSON.stringify(response.data, null, 2));

    const cards = response.data?.data || [];
    return cards[0] || null;
  } catch (error) {
    console.log("Get Saved Cards Error");
    if (error.response) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
    return null;
  }
};

// Per official Nomba docs: POST /tokenized-card/charge
const chargeTokenizedCard = async ({
  cardId,
  customerId,
  amount,
  merchantTxRef,
}) => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${process.env.NOMBA_BASE_URL}/v1/tokenized-card/charge`,
    {
      amount: Number(amount),
      currency: "NGN",
      cardId,
      customerId,
      merchantTxRef,
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

module.exports = { getSavedCards, chargeTokenizedCard };