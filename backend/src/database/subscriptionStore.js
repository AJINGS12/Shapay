const subscriptions = new Map();

const saveSubscription = (subscription) => {
  subscriptions.set(
    subscription.subscriptionId,
    subscription
  );
};

const getSubscription = (subscriptionId) => {
  return subscriptions.get(subscriptionId);
};

const updateSubscription = (
  subscriptionId,
  updates
) => {
  const subscription =
    subscriptions.get(subscriptionId);

  if (!subscription) return null;

  const updatedSubscription = {
    ...subscription,
    ...updates,
  };

  subscriptions.set(
    subscriptionId,
    updatedSubscription
  );

  return updatedSubscription;
};

const getAllSubscriptions = () => {
  return Array.from(subscriptions.values());
};

module.exports = {
  saveSubscription,
  getSubscription,
  updateSubscription,
  getAllSubscriptions,
};