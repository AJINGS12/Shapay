const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  try {
    // return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const response = await axios.post(
      `${process.env.NOMBA_BASE_URL}/v1/auth/token/issue`,
      {
        grantType: "client_credentials", // ✅ REQUIRED
        clientId: process.env.NOMBA_CLIENT_ID,
        clientSecret: process.env.NOMBA_CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        },
      }
    );

    const accessToken = response.data.data.accessToken;

    // cache token for ~55 mins
    cachedToken = accessToken;
    tokenExpiry = Date.now() + 55 * 60 * 1000;

    console.log("New Nomba access token generated");

    return accessToken;
  } catch (error) {
    console.log("Nomba Auth Error");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    throw error;
  }
};

module.exports = {
  getAccessToken,
};