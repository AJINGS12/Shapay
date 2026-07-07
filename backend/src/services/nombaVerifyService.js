const axios = require("axios");
const { getAccessToken } = require("./nombaAuthService");

const verifyTransaction = async (orderReference) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${process.env.NOMBA_BASE_URL}/v1/transactions/accounts/single`,
      {
        params: { orderReference },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        },
      }
    );

    console.log("VERIFY TRANSACTION RESPONSE:", JSON.stringify(response.data, null, 2));

    const status = response.data?.data?.status || response.data?.status;
    const isSuccess = status === "SUCCESS";

    return {
      success: isSuccess,
      raw: response.data,
    };
  } catch (error) {
    console.log("Verify Transaction Error");
    if (error.response) {
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
    throw error;
  }
};

module.exports = { verifyTransaction };