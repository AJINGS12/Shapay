const supabase = require(
  "../config/supabase"
);

const normalizeSubscription = (
  subscription
) => ({
  ...subscription,
  subscriptionId:
    subscription.subscription_id ||
    subscription.subscriptionId,
  customerEmail:
    subscription.customer_email ||
    subscription.customerEmail,
  customerName:
    subscription.customer_name ||
    subscription.customerName,
  planName:
    subscription.plan_name ||
    subscription.planName,
  createdAt:
    subscription.created_at ||
    subscription.createdAt,
  nextBillingDate:
    subscription.next_billing_date ||
    subscription.nextBillingDate,
  orderReference:
    subscription.order_reference ||
    subscription.orderReference,
});

const saveSubscription = async (
  subscription
) => {
  const { error } = await supabase
    .from("subscriptions")
    .insert([
      {
        subscription_id:
          subscription.subscriptionId,
        customer_email:
          subscription.customerEmail,
        customer_name:
          subscription.customerName,
        plan_name: subscription.planName,
        amount: subscription.amount,
        interval: subscription.interval,
        status: subscription.status,
        created_at:
          subscription.createdAt ||
          new Date(),
        next_billing_date:
          subscription.nextBillingDate,
        order_reference:
          subscription.orderReference || null,
      },
    ]);

  if (error) {
    console.log(error);
  }
};

const getSubscription = async (
  subscriptionId
) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data ? normalizeSubscription(data) : null;
};

const updateSubscription = async (
  subscriptionId,
  updates
) => {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("subscription_id", subscriptionId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  return data ? normalizeSubscription(data) : null;
};

const getSubscriptions = async () => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(error);
    return [];
  }

  return (data || []).map(normalizeSubscription);
};

module.exports = {
  saveSubscription,
  getSubscription,
  updateSubscription,
  getSubscriptions,
};