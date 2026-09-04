import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import "../animation/cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  const [message, setMessage] = useState("");

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.product_id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    toast.warning("Item removed from cart.");
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const proceedToCheckout = () => {
    if (!user || !(user.user_id || user._id)) {
      const error = "Please login as a customer to continue.";
      setMessage(error);
      toast.error(error);
      return;
    }

    if (cart.length === 0) {
      const error = "Your cart is empty.";
      setMessage(error);
      toast.warning(error);
      return;
    }

    setMessage("");
    navigate("/orders/checkout", {
      state: {
        items: cart,
        total_amount: total
      }
    });
  };

  return (
    <div className="shop-shell fade-in-page cart-page">
      <div className="shop-container">
        <div className="shop-hero">
          <div>
            <h1>Shopping Cart</h1>
            <p>
              Review your items before checkout. Premium Gold or Platinum members
              with wallet balance above Rs. 2,00,000 can place orders.
            </p>
          </div>

          <div className="premium-badge">Premium Order Rule Active</div>
        </div>

        <InlineAlert type="warning" message={message} />

        <div className="cart-layout">
          <section className="glass-card stack-card">
            <h2 className="section-title">Items</h2>

            {cart.length === 0 ? (
              <div className="empty-state">Your cart is currently empty.</div>
            ) : (
              <div className="line-items">
                {cart.map((item) => (
                  <article key={item.product_id} className="line-item hover-lift">
                    <div>
                      <div className="line-item-title">{item.product_name}</div>
                      <div className="line-item-meta">
                        {`Quantity: ${item.quantity} | Unit price: Rs. ${Number(
                          item.price
                        ).toLocaleString()}`}
                      </div>
                    </div>

                    <div className="line-item-price">
                      <div>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                      <button
                        className="btn-danger-modern hover-scale"
                        onClick={() => removeItem(item.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="glass-card stack-card">
            <h2 className="section-title">Order Summary</h2>

            <div className="summary-grid">
              <div className="summary-tile">
                <div className="summary-label">Items</div>
                <div className="summary-value">{cart.length}</div>
              </div>

              <div className="summary-tile">
                <div className="summary-label">Order total</div>
                <div className="summary-value">Rs. {total.toLocaleString()}</div>
              </div>
            </div>

            <div className="info-banner" style={{ marginTop: "18px" }}>
              Orders are validated against your subscription and wallet balance
              during checkout and again on the server.
            </div>

            <div className="cta-row">
              <button
                className="btn-modern hover-scale"
                onClick={proceedToCheckout}
                disabled={cart.length === 0}
              >
                Continue to Checkout
              </button>

              <button
                className="btn-secondary-modern hover-scale"
                onClick={() => navigate("/subscription")}
              >
                View Plans
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
