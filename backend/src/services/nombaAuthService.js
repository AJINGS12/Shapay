const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  try {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    // Debug logs — now run on every call, right before the request
    console.log("DEBUG - Client ID exists:", !!process.env.NOMBA_CLIENT_ID);
    console.log("DEBUG - Client Secret exists:", !!process.env.NOMBA_CLIENT_SECRET);
    console.log("DEBUG - Account ID:", process.env.NOMBA_PARENT_ACCOUNT_ID);
    console.log("DEBUG - Base URL:", process.env.NOMBA_BASE_URL);

    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.api.nomba.com";

    const response = await axios.post(
      `${baseUrl}/v1/auth/token/issue`,
      {
        grant_type: "client_credentials",
        client_id: process.env.NOMBA_CLIENT_ID,
        client_secret: process.env.NOMBA_CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accountId: process.env.NOMBA_PARENT_ACCOUNT_ID,
        },
      }
    );

    console.log(
      "NOMBA AUTH RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    const accessToken =
      response.data?.data?.access_token ||
      response.data?.data?.accessToken ||
      response.data?.access_token;

    if (!accessToken || accessToken.split(".").length !== 3) {
      throw new Error("Invalid JWT received from Nomba auth response");
    }

    cachedToken = accessToken;
    tokenExpiry = Date.now() + 55 * 60 * 1000;

    console.log("✅ New Nomba access token generated");

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