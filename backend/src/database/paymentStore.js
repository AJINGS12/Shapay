const supabase = require(
  "../config/supabase"
);

const savePayment = async (payment) => {
  const { error } = await supabase
    .from("payments")
    .insert([
      {
        customer_name: payment.customerName,
        customer_email: payment.customerEmail,
        amount: payment.amount,
        status: payment.status,
        order_reference: payment.orderReference || payment.merchantTxRef || null,
      },
    ]);

  if (error) {
    console.log(error);
  }
};

const getPayment = async (orderReference) => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_reference", orderReference)
    .maybeSingle();

  if (error) {
    console.log(error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    orderReference: data.order_reference,
    createdAt: data.created_at,
  };
};

const getPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(error);
    return [];
  }

  return (data || []).map((payment) => ({
    ...payment,
    customerName: payment.customer_name,
    customerEmail: payment.customer_email,
    orderReference: payment.order_reference,
    createdAt: payment.created_at,
  }));
};

const updatePaymentStatus = async (
  orderReference,
  status,
  options = {}
) => {
  try {
    const { data: exactMatch, error: exactError } =
      await supabase
        .from("payments")
        .update({ status })
        .eq("order_reference", orderReference)
        .select("*")
        .maybeSingle();

    if (exactError) {
      console.log(exactError);
    }

    if (exactMatch) {
      return exactMatch;
    }

    let query = supabase
      .from("payments")
      .select("*")
      .eq("status", "pending");

    if (options.customerEmail) {
      query = query.eq(
        "customer_email",
        options.customerEmail
      );
    }

    if (options.amount != null) {
      query = query.eq("amount", options.amount);
    }

    const { data: fallbackMatches, error: fallbackError } =
      await query.order("created_at", {
        ascending: false,
      });

    if (fallbackError) {
      console.log(fallbackError);
      return null;
    }

    const fallbackPayment = fallbackMatches?.[0];

    console.log("fallback update search", {
      orderReference,
      options,
      pendingCount: fallbackMatches?.length || 0,
      fallbackPayment: fallbackPayment || null,
    });

    if (!fallbackPayment) {
      return null;
    }

    const { error: updateError } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", fallbackPayment.id);

    if (updateError) {
      console.log(updateError);
      return null;
    }

    return {
      ...fallbackPayment,
      status,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const createActivity = async (activity) => {
  const { error } = await supabase
    .from("activities")
    .insert([
      {
        type: activity.type,
        status: activity.status,
        customer_name: activity.customer_name || activity.customerName || null,
        amount: activity.amount || 0,
        created_at: activity.created_at || activity.createdAt || new Date(),
        order_reference: activity.order_reference || activity.orderReference || null,
      },
    ]);

  if (error) {
    console.log(error);
  }
};

module.exports = {
  savePayment,
  getPayment,
  getPayments,
  updatePaymentStatus,
  createActivity,
};
