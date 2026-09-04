import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AccountConsoleShell from "../../components/layout/AccountConsoleShell";
import { getBankAccount } from "../../services/customerService";
import api from "../../utils/axios";
import { getStoredUser, getUserId } from "../../utils/session";
import {
  broadcastSubscriptionUpdate,
  clearStoredSubscription,
  normalizeSubscription,
  setStoredSubscription
} from "../../utils/subscription";
import "../../styles/gopal.css";

const customerNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    caption: "Overview, wallet, and order readiness",
    path: "/customer/dashboard",
    matchPrefixes: ["/customer/dashboard"]
  },
  {
    key: "profile",
    label: "Profile",
    caption: "Identity and account details",
    path: "/customer/profile",
    matchPrefixes: ["/customer/profile"]
  },
  {
    key: "wallet",
    label: "Wallet",
    caption: "Balance, history, and funds",
    path: "/wallet",
    matchPrefixes: ["/wallet"]
  },
  {
    key: "orders",
    label: "My Orders",
    caption: "Track purchases and delivery progress",
    path: "/orders",
    matchPrefixes: ["/orders", "/order"]
  },
  {
    key: "bank",
    label: "Bank Account",
    caption: "Saved payout and wallet banking details",
    path: "/wallet/bank-account",
    matchPrefixes: ["/wallet/bank-account"]
  },
  {
    key: "auction",
    label: "Auction",
    caption: "Join live rooms and bidding flow",
    path: "/auction/join",
    matchPrefixes: ["/auction"]
  },
  {
    key: "notifications",
    label: "Notifications",
    caption: "System, order, and room updates",
    path: "/notifications",
    matchPrefixes: ["/notifications"]
  }
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);

  const [profile, setProfile] = useState({});
  const [orders, setOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bankAccount, setBankAccount] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [orderRes, walletRes, profileRes, bankRes, subscriptionRes] = await Promise.all([
          api.get(`/order/user/${userId}`),
          api.get(`/wallet/${userId}`),
          api.get(`/customer/${userId}`),
          getBankAccount(userId).catch(() => ({})),
          api.get(`/subscription/user/${userId}`).catch(() => ({ data: { current: null } }))
        ]);

        setProfile(profileRes.data?.data || {});
        setOrders(orderRes.data?.data || []);
        setWalletBalance(Number(walletRes.data?.data?.cash_balance || 0));
        setBankAccount(bankRes || {});
        const currentSubscription = normalizeSubscription(subscriptionRes?.data?.current || null);
        setSubscription(currentSubscription);

        if (currentSubscription) {
          setStoredSubscription(currentSubscription);
        } else {
          clearStoredSubscription();
        }

        broadcastSubscriptionUpdate();
      } catch (err) {
        console.error(err);
        setMessage("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    return <Navigate to="/customer/login" replace />;
  }

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading your dashboard..." />;
  }

  const recentOrders = [...orders].slice(0, 3);
  const activeOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;
  const completionCount = [
    profile.username,
    profile.nickname,
    profile.email,
    profile.phone,
    profile.address,
    profile.dob
  ].filter(Boolean).length;
  const readinessChecks = [
    completionCount >= 4,
    Boolean(bankAccount.account_number),
    walletBalance > 0,
    orders.length > 0
  ].filter(Boolean).length;
  const readinessPercent = Math.round((readinessChecks / 4) * 100);
  const statusCounts = orders.reduce((accumulator, order) => {
    const status = order?.status || "PENDING";
    accumulator[status] = (accumulator[status] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <AccountConsoleShell
      panelTitle="Customer Panel"
      panelSubtitle="Manage profile, wallet, orders, and auction access from one premium workspace."
      navItems={customerNavItems}
      activeKey="dashboard"
      badge={subscription?.plan || "Customer Workspace"}
      userLabel={profile.username || user.username || "Customer"}
      title="Customer Dashboard"
      description="Track your account, wallet, order flow, and auction readiness from a stronger customer command space."
      meta={`Membership: ${subscription?.plan || "Inactive"} | Status: ${profile.status || "ACTIVE"}`}
      secondaryAction={{ label: "Back to Home", path: "/" }}
      primaryAction={{ label: "Add Money", path: "/wallet/add-money" }}
      onLogout={logout}
    >
      {message ? <div className="info-banner">{message}</div> : null}

      <div className="summary-grid vendor-summary-grid">
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Wallet Balance</div>
          <div className="summary-value">Rs. {walletBalance.toLocaleString()}</div>
          <div className="dashboard-stat-card__subtext">Ready cash available for shopping or wallet flows</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Total Orders</div>
          <div className="summary-value">{orders.length}</div>
          <div className="dashboard-stat-card__subtext">All orders placed from your account</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Active Orders</div>
          <div className="summary-value">{activeOrders}</div>
          <div className="dashboard-stat-card__subtext">Orders still moving through delivery</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Readiness</div>
          <div className="summary-value">{readinessPercent}%</div>
          <div className="dashboard-stat-card__subtext">How ready your account is for shopping and wallet use</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Membership</div>
          <div className="summary-value">{subscription?.plan || "Inactive"}</div>
          <div className="dashboard-stat-card__subtext">Your current premium access tier</div>
        </div>
      </div>

      <div className="dashboard-premium-grid">
        <section className="glass-card stack-card dashboard-premium-grid__main">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Customer Control Center</h2>
              <p>Your profile, saved contact details, and the actions you use most as a customer.</p>
            </div>
          </div>

          <div className="vendor-profile-badge">
            <strong>{profile.username || user.username || "Customer"}</strong>
            <span>{profile.email || user.email || "Email not set"}</span>
          </div>

          <div className="vendor-stat-list">
            <div>
              <span>Nickname</span>
              <strong>{profile.nickname || "-"}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{profile.phone || "-"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{profile.status || "ACTIVE"}</strong>
            </div>
            <div>
              <span>Membership</span>
              <strong>{subscription?.plan || "No active plan"}</strong>
            </div>
            <div>
              <span>Member Since</span>
              <strong>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : "-"}
              </strong>
            </div>
          </div>

          <div className="vendor-action-grid dashboard-card-grid">
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/customer/profile")}>
              <span className="dashboard-card__eyebrow">Identity</span>
              <strong>Edit Profile</strong>
              <span>Update account identity, address, password, and personal details.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/wallet")}>
              <span className="dashboard-card__eyebrow">Wallet</span>
              <strong>Open Wallet</strong>
              <span>Review balance, money flow, and wallet-linked activity.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/orders")}>
              <span className="dashboard-card__eyebrow">Commerce</span>
              <strong>My Orders</strong>
              <span>Track placed orders, delivery progress, and product history.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/wallet/bank-account")}>
              <span className="dashboard-card__eyebrow">Banking</span>
              <strong>Bank Account</strong>
              <span>{bankAccount.bank_name ? "Update your saved bank details." : "Add bank details for wallet-related flows."}</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/auction/join")}>
              <span className="dashboard-card__eyebrow">Auction</span>
              <strong>Join Auction</strong>
              <span>Enter the live bidding flow when an auction room is open.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/notifications")}>
              <span className="dashboard-card__eyebrow">Updates</span>
              <strong>Notifications</strong>
              <span>Catch up on order, payment, and system updates quickly.</span>
            </button>
          </div>
        </section>

        <aside className="glass-card stack-card dashboard-premium-grid__side">
          <h2 className="section-title">Readiness Snapshot</h2>

          <div className="vendor-progress">
            <div className="vendor-progress__head">
              <span>Shopping readiness</span>
              <strong>{readinessPercent}%</strong>
            </div>
            <div className="vendor-progress__bar">
              <span style={{ width: `${readinessPercent}%` }} />
            </div>
          </div>

          <div className="vendor-stat-list">
            <div>
              <span>Profile Completion</span>
              <strong>{Math.round((completionCount / 6) * 100)}%</strong>
            </div>
            <div>
              <span>Bank Saved</span>
              <strong>{bankAccount.bank_name ? "Yes" : "No"}</strong>
            </div>
            <div>
              <span>Wallet Ready</span>
              <strong>{walletBalance > 0 ? "Yes" : "No"}</strong>
            </div>
            <div>
              <span>Order History</span>
              <strong>{orders.length > 0 ? "Available" : "Empty"}</strong>
            </div>
          </div>

          <div className="dashboard-callout" style={{ marginTop: "20px" }}>
            <span className="dashboard-callout__label">Current Access</span>
            <strong>{subscription?.plan || "Standard customer mode"}</strong>
            <p>Keep wallet, bank details, and profile complete to unlock a smoother shopping and bidding experience.</p>
          </div>

          <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
            <h3>Saved Bank Details</h3>
            <p>{bankAccount.bank_name || "No bank details saved yet."}</p>
            <div className="vendor-line-item">
              <span>Holder</span>
              <strong>{bankAccount.account_holder_name || "-"}</strong>
            </div>
            <div className="vendor-line-item">
              <span>IFSC</span>
              <strong>{bankAccount.ifsc_code || "-"}</strong>
            </div>
          </div>
        </aside>
      </div>

      <div className="dashboard-premium-grid">
        <section className="glass-card stack-card dashboard-premium-grid__main">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Recent Orders</h2>
              <p>Your latest purchase activity at a glance.</p>
            </div>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/orders")}>
              View All Orders
            </button>
          </div>

          <div className="vendor-order-list">
            {recentOrders.length === 0 ? (
              <div className="empty-state vendor-empty-state">No orders yet. Start shopping to build your order history.</div>
            ) : (
              recentOrders.map((order) => (
                <article key={order._id} className="vendor-order-card">
                  <div className="vendor-order-card__top">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p>{order.items?.length || 0} items</p>
                    </div>
                    <span className={`status ${order.status || "PENDING"}`}>
                      {order.status || "PENDING"}
                    </span>
                  </div>
                  <div className="vendor-order-card__meta">
                    <span>Rs. {Number(order.total_amount || 0).toLocaleString()}</span>
                    <span>{new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString("en-IN")}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="glass-card stack-card dashboard-premium-grid__side">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Order Status Mix</h2>
              <p>Quick read on your current purchase pipeline.</p>
            </div>
          </div>

          <div className="vendor-status-breakdown">
            {Object.keys(statusCounts).length === 0 ? (
              <div className="empty-state vendor-empty-state">No order data yet.</div>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="vendor-status-breakdown__item">
                  <span className={`status ${status}`}>{status}</span>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AccountConsoleShell>
  );
}
