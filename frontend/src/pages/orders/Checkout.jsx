import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction, showResultAlert } from "../../utils/alerts";
import api from "../../utils/axios";

const paymentOptions = [
  {
    value: "WALLET",
    title: "Wallet",
    description: "Instant confirmation if your wallet has enough balance."
  },
  {
    value: "UPI",
    title: "UPI",
    description: "Create the order now and collect payment through your UPI flow."
  },
  {
    value: "COD",
    title: "Cash on Delivery",
    description: "Customer pays when the order is delivered."
  },
  {
    value: "CARD",
    title: "Card",
    description: "Mark the order for card payment processing."
  },
  {
    value: "BANKING",
    title: "Net Banking",
    description: "Mark the order for bank transfer or net banking confirmation."
  }
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const getStoredCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

export default function OrderCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const user = getStoredUser();
  const userId = user?.user_id || user?._id || "";
  const orderDraft = location.state || {};

  const [eligibility, setEligibility] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [paymentMethod, setPaymentMethod] = useState("WALLET");

  const items = useMemo(() => {
    const sourceItems =
      Array.isArray(orderDraft.items) && orderDraft.items.length > 0
        ? orderDraft.items
        : getStoredCart();

    return sourceItems
      .map((item) => {
        const productId = item?.product_id?._id || item?.product_id || item?._id;
        const quantity = Number(item?.quantity);
        const price = Number(item?.price);

        if (
          !productId ||
          quantity <= 0 ||
          price < 0 ||
          Number.isNaN(quantity) ||
          Number.isNaN(price)
        ) {
          return null;
        }

        return {
          product_id: String(productId),
          quantity,
          price,
          product_name:
            item?.product_name || item?.product_id?.product_name || "Product"
        };
      })
      .filter(Boolean);
  }, [orderDraft.items]);

  const total = useMemo(() => {
    const draftTotal = Number(orderDraft.total_amount);

    if (!Number.isNaN(draftTotal) && draftTotal > 0) {
      return draftTotal;
    }

    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items, orderDraft.total_amount]);

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!userId || total <= 0) {
        setLoadingEligibility(false);
        return;
      }

      try {
        setLoadingEligibility(true);
        const { data } = await api.get(
          `/order/eligibility/${userId}?total_amount=${total}`
        );
        setEligibility(data.data);
      } catch (err) {
        setFeedback({
          type: "error",
          text:
            err.response?.data?.message ||
            "Unable to validate order eligibility."
        });
      } finally {
        setLoadingEligibility(false);
      }
    };

    fetchEligibility();
  }, [userId, total]);

  const walletRequired = paymentMethod === "WALLET";
  const canPlaceOrder =
    Boolean(userId) &&
    items.length > 0 &&
    total > 0 &&
    !loadingEligibility &&
    (walletRequired ? Boolean(eligibility?.walletEligible) : true);

  const placeOrder = async () => {
    if (!canPlaceOrder) {
      const message =
        eligibility?.reasons?.[0] ||
        (userId
          ? "You are not eligible to place this order."
          : "Please login before placing your order.");

      setFeedback({
        type: "error",
        text: message
      });
      toast.error(message);
      return;
    }

    try {
      const confirmation = await confirmAction({
        title: "Place this order?",
        text: walletRequired
          ? `Rs. ${total.toLocaleString()} will be deducted from your wallet after the order is created.`
          : `This order will be created with ${paymentMethod} as the selected payment method.`,
        confirmButtonText: "Confirm order"
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setSubmitting(true);
      setFeedback({ type: "", text: "" });

      const { data } = await api.post("/order", {
        user_id: userId,
        items: items.map(({ product_id, quantity, price }) => ({
          product_id,
          quantity,
          price
        })),
        total_amount: total,
        payment_method: paymentMethod
      });

      localStorage.removeItem("cart");
      toast.success("Order placed successfully.");
      await showResultAlert({
        title: "Order confirmed",
        text: "Your wallet has been updated and your order is now active."
      });

      navigate("/order-success", {
        state: {
          order: data?.data?.order || data?.data || null,
          wallet_balance: data?.data?.wallet_balance
        }
      });
    } catch (err) {
      const message = err.response?.data?.message || "Order failed";
      setFeedback({
        type: "error",
        text: message
      });
      toast.error(message);

      if (err.response?.data?.data) {
        setEligibility(err.response.data.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page checkout-page">
      <div className="shop-container">
        <div className="shop-hero">
          <div>
            <h1>Secure Checkout</h1>
            <p>
              Orders are now validated directly against your live wallet balance.
              If your wallet covers the cart total, you can place the order
              immediately.
            </p>
          </div>

          {eligibility?.activeSubscription?.plan ? (
            <div className="premium-badge">
              {eligibility.activeSubscription.plan} Member
            </div>
          ) : null}
        </div>

        <div className="checkout-layout">
          <section className="glass-card stack-card">
            <h2 className="section-title">Review Items</h2>

            {items.length > 0 ? (
              <div className="checkout-item-table">
                {items.map((item) => (
                  <div className="checkout-row hover-lift" key={item.product_id}>
                    <div>
                      <div className="line-item-title">{item.product_name}</div>
                      <div className="line-item-meta">
                        {`Quantity: ${item.quantity} | Unit price: Rs. ${item.price.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="line-item-price">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No items available for checkout.</div>
            )}
          </section>

          <aside className="glass-card stack-card">
            <h2 className="section-title">Eligibility & Payment</h2>

            <div className="summary-grid">
              <div className="summary-tile">
                <div className="summary-label">Order total</div>
                <div className="summary-value">Rs. {total.toLocaleString()}</div>
              </div>

              <div className="summary-tile">
                <div className="summary-label">Wallet balance</div>
                <div className="summary-value">
                  Rs. {Number(eligibility?.walletBalance || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="status-panel checkout-payment-grid" style={{ marginTop: "18px" }}>
              <div className="summary-tile">
                <div className="summary-label">Payment method</div>
                <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                  {paymentOptions.map((option) => (
                    <label
                      className="line-item hover-lift checkout-choice-card"
                      style={{ cursor: "pointer" }}
                      key={option.value}
                    >
                      <div>
                        <div className="line-item-title">{option.title}</div>
                        <div className="line-item-meta">{option.description}</div>
                      </div>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === option.value}
                        onChange={() => setPaymentMethod(option.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {loadingEligibility ? (
                <div className="info-banner">
                  <LoadingSpinner label="Checking your wallet balance..." />
                </div>
              ) : !walletRequired ? (
                <div className="success-banner">
                  {paymentMethod} is enabled. The order will be created and kept
                  pending until payment or delivery confirmation.
                </div>
              ) : eligibility?.walletEligible ? (
                <div className="success-banner">
                  You are eligible to place this order. The amount will be
                  deducted from your wallet immediately after success.
                </div>
              ) : (
                <div className="warning-banner">
                  You cannot proceed yet. Review the requirements below.
                </div>
              )}

              {feedback.text ? (
                <div className={`${feedback.type}-banner`}>{feedback.text}</div>
              ) : null}

              {walletRequired && eligibility?.reasons?.length ? (
                <ul className="reason-list">
                  {eligibility.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="cta-row checkout-sidebar-actions">
              <button
                className="btn-modern hover-scale"
                onClick={placeOrder}
                disabled={submitting || !canPlaceOrder}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>

              <button
                className="btn-secondary-modern hover-scale"
                onClick={() => navigate("/subscription")}
              >
                Upgrade Subscription
              </button>

              <button
                className="btn-secondary-modern hover-scale"
                onClick={() => navigate("/wallet/add-money")}
              >
                Add Wallet Funds
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
