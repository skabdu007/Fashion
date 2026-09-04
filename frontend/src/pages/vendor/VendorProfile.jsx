import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { broadcastSessionUpdate, getStoredUser, getStoredVendor } from "../../utils/session";
import {
  calculateVendorOverview,
  filterVendorOrders,
  filterVendorProducts,
  formatCompactDate,
  getVendorId
} from "../../utils/vendorWorkspace";
import "../../styles/gopal.css";

const createVendorForm = (profile) => ({
  shop_name: profile?.shop_name || "",
  owner_name: profile?.owner_name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  address: profile?.address || "",
  password: "",
  confirmPassword: ""
});

export default function VendorProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const storedVendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(storedVendor, user);

  const [profile, setProfile] = useState(storedVendor);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(createVendorForm(storedVendor));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const vendorProducts = useMemo(
    () => filterVendorProducts(products, vendorId),
    [products, vendorId]
  );
  const vendorOrders = useMemo(
    () => filterVendorOrders(orders, vendorProducts),
    [orders, vendorProducts]
  );
  const overview = useMemo(
    () => calculateVendorOverview(vendorProducts, vendorOrders),
    [vendorProducts, vendorOrders]
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        const [profileRes, productRes, orderRes] = await Promise.all([
          api.get("/vendor/profile"),
          api.get("/product"),
          api.get("/order/admin/all")
        ]);

        const nextProfile = profileRes.data?.data || storedVendor;
        setProfile(nextProfile);
        setForm(createVendorForm(nextProfile));
        setProducts(productRes.data?.data || []);
        setOrders(orderRes.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Unable to load vendor profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [storedVendor, toast, vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.shop_name.trim() || !form.owner_name.trim() || !form.email.trim()) {
      toast.error("Shop name, owner name, and email are required.");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Password confirmation does not match.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        shop_name: form.shop_name.trim(),
        owner_name: form.owner_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const res = await api.put(`/vendor/${profile?._id || vendorId}/profile`, payload);
      const updated = res.data?.data || {};

      setProfile(updated);
      setForm(createVendorForm(updated));

      localStorage.setItem("vendor", JSON.stringify(updated));
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: "VENDOR",
          user_id: updated._id,
          username: updated.owner_name,
          email: updated.email
        })
      );
      broadcastSessionUpdate();

      toast.success("Vendor profile updated.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to update vendor profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading vendor profile..." />;
  }

  const completionCount = [
    form.shop_name,
    form.owner_name,
    form.email,
    form.phone,
    form.address
  ].filter(Boolean).length;
  const completionPercent = Math.round((completionCount / 5) * 100);
  const statusClass =
    profile?.status === "APPROVED"
      ? "APPROVED"
      : profile?.status === "BLOCKED"
        ? "CANCELLED"
        : "PENDING";

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Vendor Profile</h1>
            <p>Manage store identity, owner contact details, and account readiness from a dedicated vendor profile workspace.</p>
          </div>

          <div className="vendor-hero__actions">
            <span className={`status ${statusClass}`}>{profile?.status || "PENDING"}</span>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn-modern hover-scale" onClick={() => navigate("/vendor/inventory")}>
              Open Inventory
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">Profile Score</div>
            <div className="summary-value">{completionPercent}%</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Products</div>
            <div className="summary-value">{overview.totalProducts}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Orders</div>
            <div className="summary-value">{vendorOrders.length}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Revenue</div>
            <div className="summary-value">Rs. {Math.round(overview.totalRevenue).toLocaleString()}</div>
          </div>
        </div>

        <div className="vendor-dashboard-grid">
          <section className="glass-card stack-card vendor-dashboard-grid__main">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">Store Identity</h2>
                <p>Keep the storefront name, owner identity, and contact details current for cleaner operations.</p>
              </div>
            </div>

            <div className="vendor-profile-badge">
              <strong>{profile?.shop_name || "Vendor Store"}</strong>
              <span>{profile?.owner_name || "Owner not set"}</span>
            </div>

            <form onSubmit={handleSubmit} className="status-panel">
              <div className="vendor-form-grid">
                <input
                  name="shop_name"
                  value={form.shop_name}
                  onChange={handleChange}
                  placeholder="Shop Name"
                />
                <input
                  name="owner_name"
                  value={form.owner_name}
                  onChange={handleChange}
                  placeholder="Owner Name"
                />
              </div>

              <div className="vendor-form-grid">
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Business Email"
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
              </div>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={4}
                placeholder="Business Address"
              />

              <div className="vendor-form-grid">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="New Password (optional)"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
              </div>

              <div className="cta-row">
                <button type="submit" className="btn-modern hover-scale" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  className="btn-secondary-modern hover-scale"
                  onClick={() => navigate("/vendor/orders")}
                >
                  View Orders
                </button>
              </div>
            </form>

            <div className="vendor-action-grid">
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/vendor/inventory")}>
                <strong>Inventory Control</strong>
                <span>Create listings, adjust stock, and manage auction-ready items.</span>
              </button>
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/vendor/orders")}>
                <strong>Order Pipeline</strong>
                <span>Review customer orders that include your products and update progress.</span>
              </button>
              <button className="dashboard-card vendor-action-card" onClick={() => navigate("/vendor/sales-analytics")}>
                <strong>Sales Signals</strong>
                <span>Watch revenue, top products, and fulfillment patterns in one place.</span>
              </button>
            </div>
          </section>

          <aside className="glass-card stack-card vendor-dashboard-grid__side">
            <h2 className="section-title">Business Snapshot</h2>

            <div className="vendor-progress">
              <div className="vendor-progress__head">
                <span>Profile completion</span>
                <strong>{completionPercent}%</strong>
              </div>
              <div className="vendor-progress__bar">
                <span style={{ width: `${completionPercent}%` }} />
              </div>
            </div>

            <div className="vendor-stat-list">
              <div>
                <span>Member Since</span>
                <strong>{formatCompactDate(profile?.createdAt || profile?.created_at)}</strong>
              </div>
              <div>
                <span>Last Login</span>
                <strong>{formatCompactDate(profile?.lastLogin)}</strong>
              </div>
              <div>
                <span>Active Listings</span>
                <strong>{overview.activeProducts}</strong>
              </div>
              <div>
                <span>Inactive Listings</span>
                <strong>{overview.inactiveProducts}</strong>
              </div>
              <div>
                <span>Low Stock</span>
                <strong>{overview.lowStockProducts}</strong>
              </div>
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Store Reach</h3>
              <div className="vendor-line-item">
                <span>Total Views</span>
                <strong>{overview.totalViews.toLocaleString()}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Units Sold</span>
                <strong>{overview.totalUnitsSold.toLocaleString()}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Average Rating</span>
                <strong>{overview.averageRating ? overview.averageRating.toFixed(1) : "-"}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Auction Ready</span>
                <strong>{overview.auctionExclusive}</strong>
              </div>
            </div>

            <div className="vendor-panel-card" style={{ marginTop: "20px" }}>
              <h3>Top Product</h3>
              <p>{overview.topProduct?.product_name || "No sales recorded yet."}</p>
              <div className="vendor-line-item">
                <span>Sold Count</span>
                <strong>{overview.topProduct?.sold_count || 0}</strong>
              </div>
              <div className="vendor-line-item">
                <span>Status</span>
                <strong>{overview.topProduct?.status || "ACTIVE"}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
