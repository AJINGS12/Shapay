const supabase = require("../config/supabase");

const getMerchantProfile = async (merchantId) => {
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data;
};

const upsertMerchantProfile = async (merchantId, { businessName, businessEmail }) => {
  const { data, error } = await supabase
    .from("merchants")
    .upsert(
      {
        merchant_id: merchantId,
        business_name: businessName,
        business_email: businessEmail,
        updated_at: new Date(),
      },
      { onConflict: "merchant_id" }
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data;
};

module.exports = { getMerchantProfile, upsertMerchantProfile };