const {
  getSubscriptions,
  updateSubscription,
} = require("../database/subscriptionStore");

const {
  savePayment,
} = require("../database/paymentStore");

const {
  initializePayment,
} = require("./nombaCheckoutService");

const processRecurringBilling = async () => {
  console.log("Running recurring billing job...");

  const subscriptions = await getSubscriptions();

  const now = new Date();

  for (const subscription of subscriptions) {
    if (subscription.status !== "active") {
      continue;
    }

    const nextBillingDate = new Date(
      subscription.nextBillingDate
    );

    if (nextBillingDate > now) {
      continue;
    }

    try {
      const recurringReference =
        `renewal_${Date.now()}`;

      const payment = await initializePayment({
        amount: subscription.amount,
        customerName:
          subscription.customerName,
        customerEmail:
          subscription.customerEmail,
        merchantTxRef: recurringReference,
      });

      savePayment({
        orderReference:
          payment.data.orderReference,
        amount: subscription.amount,
        customerName:
          subscription.customerName,
        customerEmail:
          subscription.customerEmail,
        status: "pending",
        createdAt: new Date(),
      });

      updateSubscription(
        subscription.subscriptionId,
        {
          lastRenewalAttempt: new Date(),
          latestCheckoutLink:
            payment.data.checkoutLink,
          nextBillingDate: new Date(
            Date.now() +
              30 * 24 * 60 * 60 * 1000
          ),
        }
      );

      console.log(
        `Recurring invoice generated for ${subscription.subscriptionId}`
      );
    } catch (error) {
      console.log(
        `Recurring billing failed for ${subscription.subscriptionId}`
      );

      console.log(error.message);
    }
  }
};

module.exports = {
  processRecurringBilling,
};