import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { getBankAccount } from "../../services/customerService";
import api from "../../utils/axios";
import { broadcastSessionUpdate, getStoredUser, getUserId } from "../../utils/session";
import "../../styles/gopal.css";

const emptyBank = {
  account_holder_name: "",
  account_number: "",
  ifsc_code: "",
  bank_name: ""
};

const createProfileForm = (profile) => ({
  username: profile?.username || "",
  nickname: profile?.nickname || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  address: profile?.address || "",
  dob: profile?.dob ? profile.dob.substring(0, 10) : "",
  password: "",
  confirmPassword: ""
});

const maskAccountNumber = (value = "") => {
  const trimmed = String(value).replace(/\s+/g, "");

  if (!trimmed) {
    return "-";
  }

  const visible = trimmed.slice(-4);
  return `${"*".repeat(Math.max(trimmed.length - 4, 0))}${visible}`;
};

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const userId = getUserId(user);

  const [walletBalance, setWalletBalance] = useState(0);
  const [orders, setOrders] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [profileMeta, setProfileMeta] = useState({});
  const [bankAccount, setBankAccount] = useState(emptyBank);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(createProfileForm(null));

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        const [profileRes, walletRes, orderRes, bankRes] = await Promise.all([
          api.get(`/customer/${userId}`),
          api.get(`/wallet/${userId}`),
          api.get(`/order/user/${userId}`),
          getBankAccount(userId).catch(() => emptyBank)
        ]);

        const profile = profileRes.data?.data || {};
        const nextOrders = orderRes.data?.data || [];

        setForm(createProfileForm(profile));
        setProfileMeta(profile);
        setOrders(nextOrders);
        setWalletBalance(Number(walletRes.data?.data?.cash_balance || 0));
        setTotalSpent(Number(profile.total_spent || 0));
        setBankAccount({ ...emptyBank, ...(bankRes || {}) });
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast, userId]);

  if (!user || user.role?.toUpperCase() !== "CUSTOMER") {
    return <Navigate to="/customer/login" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Username and email are required.");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Password confirmation does not match.");
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        dob: form.dob || null
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const res = await api.put(`/customer/${userId}`, payload);
      const updated = res.data?.data || {};

      setProfileMeta((current) => ({ ...current, ...updated }));
      setForm(createProfileForm(updated));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          user_id: userId,
          username: updated.username || payload.username,
          email: updated.email || payload.email
        })
      );
      broadcastSessionUpdate();

      toast.success("Customer profile updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Profile update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading profile..." />;
  }

  const completionCount = [
    form.username,
    form.nickname,
    form.email,
    form.phone,
    form.address,
    form.dob
  ].filter(Boolean).length;
  const readinessChecks = [
    completionCount >= 4,
    Boolean(bankAccount.account_number),
    walletBalance > 0,
    orders.length > 0
  ].filter(Boolean).length;
  const readinessPercent = Math.round((readinessChecks / 4) * 100);
  const recentOrders = [...orders].slice(0, 3);

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Customer Profile</h1>
            <p>Keep your account polished, update personal details, and stay ready for shopping, wallet use, and live auction participation.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/customer/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn-modern hover-scale" onClick={() => navigate("/wallet/bank-account")}>
              Manage Bank Account
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">Wallet Balance</div>
            <div className="summary-value">Rs. {walletBalance.toLocaleString()}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Orders</div>
            <div className="summary-value">{orders.length}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">Rs. {Math.round(totalSpent).toLocaleString()}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Readiness</div>
            <div className="summary-value">{readinessPercent}%</div>
          </div>
        </div>

        <div className="vendor-dashboard-grid">
          <section className="glass-card stack-card vendor-dashboard-grid__main">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">Profile Details</h2>
                <p>Update identity, contact details, address, birthday, and optional password from one cleaner screen.</p>
              </div>
            </div>

            <div className="vendor-profile-badge">
              <strong>{profileMeta.username || user.username || "Customer"}</strong>
              <span>{profileMeta.email || user.email || "Email not set"}</span>
            </div>

            <form onSubmit={handleSubmit} className="status-panel">
              <div className="vendor-form-grid">
                <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
                <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="Nickname" />
              </div>

              <div className="vendor-form-grid">
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
              </div>

              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" rows={4} />

              <div className="vendor-form-grid">
                <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="New Password (optional)"
                />
              </div>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
              />

              <div className="cta-row">
                <button type="submit" className="btn-modern hover-scale" disabled={updating}>
                  {updating ? "Updating..." : "Save Profile"}
                </button>
                <button type="button" className="btn-secondary-modern hover-scale" onClick={() => navigate("/orders")}>
                  View Orders
                </button>
              </div>
            </form>

            <div className="vendor-action-grid">
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/wallet")}>
                <strong>Open Wallet</strong>
                <span>Review balance, recent movement, and add-money actions.</span>
              </button>
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/wallet/add-money")}>
                <strong>Add Money</strong>
                <span>Keep the wallet ready for faster checkout and auction activity.</span>
              </button>
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/auction/join")}>
                <strong>Join Auction</strong>
                <span>Jump into a live room when you are ready to place bids.</span>
              </button>
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/notifications")}>
                <strong>Notifications</strong>
                <span>Check order, payment, and platform updates from one feed.</span>
              </button>
            </div>
          </section>

          <aside className="glass-card stack-card vendor-dashboard-grid__side">
            <h2 className="section-title">Account Snapshot</h2>

            <div className="vendor-progress">
              <div className="vendor-progress__head">
                <span>Profile completion</span>
                <strong>{Math.round((completionCount / 6) * 100)}%</strong>
              </div>
              <div className="vendor-progress__bar">
                <span style={{ width: `${(completionCount / 6) * 100}%` }} />
              </div>
            </div>

            <div className="vendor-stat-list">
              <div>
                <span>Member Since</span>
                <strong>
                  {profileMeta.created_at
                    ? new Date(profileMeta.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "-"}
                </strong>
              </div>
              <div>
                <span>Last Login</span>
                <strong>
                  {profileMeta.last_login
                    ? new Date(profileMeta.last_login).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "-"}
                </strong>
              </div>
              <div>
                <span>Account Status</span>
                <strong>{profileMeta.status || "ACTIVE"}</strong>
              </div>
              <div>
                <span>Birthday</span>
                <strong>{form.dob || "-"}</strong>
              </div>
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Saved Bank Account</h3>
              <p>{bankAccount.bank_name || "No bank account saved yet."}</p>
              <div className="vendor-line-item">
                <span>Holder</span>
                <strong>{bankAccount.account_holder_name || "-"}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Account</span>
                <strong>{maskAccountNumber(bankAccount.account_number)}</strong>
              </div>
              <div className="vendor-line-item">
                <span>IFSC</span>
                <strong>{bankAccount.ifsc_code || "-"}</strong>
              </div>
              <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/wallet/bank-account")}>
                Edit Bank Account
              </button>
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Recent Activity</h3>
              {recentOrders.length === 0 ? (
                <p>No orders placed yet.</p>
              ) : (
                <div className="vendor-stat-list">
                  {recentOrders.map((order) => (
                    <div key={order._id}>
                      <span>#{String(order._id).slice(-6)}</span>
                      <strong>{order.status || "PENDING"}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
