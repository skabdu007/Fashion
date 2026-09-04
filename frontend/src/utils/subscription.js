const SUBSCRIPTION_STORAGE_KEY = "active_subscription";
const VALID_PLANS = new Set(["SILVER", "GOLD", "PLATINUM"]);

export const normalizePlanName = (value) => {
  const plan = String(value || "").trim().toUpperCase();
  return VALID_PLANS.has(plan) ? plan : "";
};

export const normalizeSubscription = (subscription) => {
  if (!subscription) {
    return null;
  }

  if (typeof subscription === "string") {
    const planFromString = normalizePlanName(subscription);
    return planFromString ? { plan: planFromString, status: "ACTIVE" } : null;
  }

  const plan = normalizePlanName(subscription.plan || subscription.plan_name || subscription.name);
  const status = String(subscription.status || "").toUpperCase();

  if (!plan || (status && status !== "ACTIVE")) {
    return null;
  }

  return {
    ...subscription,
    plan,
    status: status || "ACTIVE"
  };
};

export const getStoredSubscription = () => {
  try {
    return normalizeSubscription(
      JSON.parse(localStorage.getItem(SUBSCRIPTION_STORAGE_KEY) || "null")
    );
  } catch {
    return null;
  }
};

export const setStoredSubscription = (subscription) => {
  const normalized = normalizeSubscription(subscription);

  if (!normalized) {
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    return null;
  }

  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const clearStoredSubscription = () => {
  localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
};

export const getSubscriptionLabel = (subscription) =>
  normalizeSubscription(subscription)?.plan || "";

export const broadcastSubscriptionUpdate = () => {
  window.dispatchEvent(new Event("subscription-updated"));
};
