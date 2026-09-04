import { useEffect, useMemo, useState } from "react";
import api from "../../utils/axios";
import {
  broadcastSubscriptionUpdate,
  clearStoredSubscription,
  normalizeSubscription,
  setStoredSubscription
} from "../../utils/subscription";
import "../../styles/gopal.css";

const PLANS = [
  {
    name: "SILVER",
    price: "Rs. 499",
    duration: "1 Month",
    description: [
      "Standard auction access",
      "Entry-level member benefits",
      "Does not unlock premium ordering"
    ]
  },
  {
    name: "GOLD",
    price: "Rs. 999",
    duration: "6 Months",
    featured: true,
    description: [
      "Premium ordering enabled",
      "Priority auction access",
      "Faster support response"
    ]
  },
  {
    name: "PLATINUM",
    price: "Rs. 2999",
    duration: "1 Year",
    description: [
      "Highest premium tier",
      "Premium ordering enabled",
      "VIP support and access"
    ]
  }
];

export default function Subscription() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.user_id || user?._id;

  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const premiumPlans = useMemo(() => new Set(["GOLD", "PLATINUM"]), []);

  useEffect(() => {
    const loadCurrentSubscription = async () => {
      if (!userId) {
        clearStoredSubscription();
        return;
      }

      try {
        const res = await api.get(`/subscription/user/${userId}`);
        const nextPlan = normalizeSubscription(res.data?.current || null);
        setCurrentPlan(nextPlan);

        if (nextPlan) {
          setStoredSubscription(nextPlan);
        } else {
          clearStoredSubscription();
        }

        broadcastSubscriptionUpdate();
      } catch (error) {
        console.error(error);
      }
    };

    loadCurrentSubscription();
  }, [userId]);

  const subscribe = async (selectedPlan) => {
    if (!userId) {
      setFeedback({
        type: "error",
        text: "Login first to activate a subscription."
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", text: "" });

      const res = await api.post("/subscription", {
        user_id: userId,
        plan: selectedPlan
      });

      const nextPlan = normalizeSubscription(res.data?.data || null);
      setCurrentPlan(nextPlan);

      if (nextPlan) {
        setStoredSubscription(nextPlan);
      } else {
        clearStoredSubscription();
      }

      broadcastSubscriptionUpdate();
      setFeedback({
        type: "success",
        text: `${selectedPlan} plan activated successfully.`
      });
    } catch (error) {
      console.error("Subscription error:", error);
      setFeedback({
        type: "error",
        text: error.response?.data?.message || "Subscription failed."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="shop-hero">
          <div>
            <h1>Membership Plans</h1>
            <p>
              Choose the tier that fits your access level. Gold and Platinum members
              can place premium orders when the wallet balance is above Rs. 2,00,000.
            </p>
          </div>

          {currentPlan ? (
            <div className="premium-badge">
              Active: {currentPlan.plan}
            </div>
          ) : null}
        </div>

        {feedback.text ? (
          <div className={`${feedback.type}-banner`} style={{ marginBottom: "18px" }}>
            {feedback.text}
          </div>
        ) : null}

        <div className="plan-grid-modern">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan?.plan === plan.name && currentPlan?.status === "ACTIVE";

            return (
              <div
                key={plan.name}
                className={`plan-card-modern ${plan.featured ? "featured" : ""}`}
              >
                <div className="summary-label">
                  {premiumPlans.has(plan.name) ? "Premium plan" : "Standard plan"}
                </div>
                <h2 style={{ textAlign: "left", marginBottom: "0" }}>{plan.name}</h2>
                <div className="plan-price">{plan.price}</div>
                <div className="plan-meta">{plan.duration}</div>

                <ul className="plan-features">
                  {plan.description.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <button
                  className={plan.featured ? "btn-secondary-modern" : "btn-modern"}
                  disabled={loading || isCurrent}
                  onClick={() => subscribe(plan.name)}
                >
                  {isCurrent ? "Current Plan" : loading ? "Activating..." : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
