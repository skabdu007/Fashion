import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import AccountConsoleShell from "../../components/layout/AccountConsoleShell";
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

const vendorNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    caption: "Store overview and quick actions",
    path: "/vendor/dashboard",
    matchPrefixes: ["/vendor/dashboard"]
  },
  {
    key: "profile",
    label: "Profile",
    caption: "Store details and owner information",
    path: "/vendor/profile",
    matchPrefixes: ["/vendor/profile"]
  },
  {
    key: "inventory",
    label: "Inventory",
    caption: "Catalog, stock, and product edits",
    path: "/vendor/inventory",
    matchPrefixes: ["/vendor/inventory"]
  },
  {
    key: "orders",
    label: "Orders",
    caption: "Incoming orders for your products",
    path: "/vendor/orders",
    matchPrefixes: ["/vendor/orders", "/vendor/order"]
  },
  {
    key: "analytics",
    label: "Analytics",
    caption: "Revenue, trends, and performance",
    path: "/vendor/sales-analytics",
    matchPrefixes: ["/vendor/sales-analytics"]
  },
  {
    key: "notifications",
    label: "Notifications",
    caption: "Buyer and account updates",
    path: "/notifications",
    matchPrefixes: ["/notifications"]
  }
];

const createProfileForm = (profile) => ({
  shop_name: profile?.shop_name || "",
  owner_name: profile?.owner_name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  address: profile?.address || ""
});

export default function VendorDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const storedVendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(storedVendor, user);

  const [profile, setProfile] = useState(storedVendor);
  const [form, setForm] = useState(createProfileForm(storedVendor));
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
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
    const loadWorkspace = async () => {
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
        setForm(createProfileForm(nextProfile));
        setProducts(productRes.data?.data || []);
        setOrders(orderRes.data?.data || []);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Unable to load vendor workspace.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [storedVendor, toast, vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const logout = () => {
    localStorage.removeItem("vendor");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    navigate("/vendor/login");
  };

  const updateProfile = async () => {
    if (!profile?._id) return;

    try {
      setSaving(true);
      const res = await api.put(`/vendor/${profile._id}/profile`, form);
      const updated = res.data?.data || {};

      setProfile(updated);
      setForm(createProfileForm(updated));
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
    return <LoadingSpinner centered label="Loading vendor dashboard..." />;
  }

  const statusClass =
    profile?.status === "APPROVED"
      ? "APPROVED"
      : profile?.status === "BLOCKED"
        ? "CANCELLED"
        : "PENDING";

  const recentProducts = [...vendorProducts]
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))
    .slice(0, 3);

  const recentOrders = [...vendorOrders]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 3);

  const profileCompletion = [
    profile?.shop_name,
    profile?.owner_name,
    profile?.email,
    profile?.phone,
    profile?.address
  ].filter(Boolean).length;

  return (
    <AccountConsoleShell
      panelTitle="Vendor Panel"
      panelSubtitle="Control inventory, orders, profile, and performance from one premium workspace."
      navItems={vendorNavItems}
      activeKey="dashboard"
      badge={profile?.status || "Vendor Workspace"}
      userLabel={profile?.shop_name || profile?.owner_name || "Vendor Store"}
      title="Vendor Dashboard"
      description="Control inventory, monitor orders, manage store profile, and track business performance from a stronger vendor command space."
      meta={`Owner: ${profile?.owner_name || "Not set"} | Status: ${profile?.status || "PENDING"}`}
      secondaryAction={{ label: "Back to Home", path: "/" }}
      primaryAction={{ label: "Add or Edit Products", path: "/vendor/inventory" }}
      onLogout={logout}
    >
      <div className="summary-grid vendor-summary-grid">
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Inventory</div>
          <div className="summary-value">{overview.totalProducts}</div>
          <div className="dashboard-stat-card__subtext">Products currently owned by your store</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Pending Orders</div>
          <div className="summary-value">{overview.pendingOrders}</div>
          <div className="dashboard-stat-card__subtext">Orders waiting to move forward</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Delivered</div>
          <div className="summary-value">{overview.deliveredOrders}</div>
          <div className="dashboard-stat-card__subtext">Completed deliveries across your catalog</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Revenue</div>
          <div className="summary-value">Rs. {Math.round(overview.totalRevenue).toLocaleString()}</div>
          <div className="dashboard-stat-card__subtext">Revenue tied to your fulfilled and active orders</div>
        </div>
        <div className="summary-tile dashboard-stat-card">
          <div className="summary-label">Units Sold</div>
          <div className="summary-value">{overview.totalUnitsSold}</div>
          <div className="dashboard-stat-card__subtext">Total units sold from your store</div>
        </div>
      </div>

      <div className="dashboard-premium-grid">
        <section className="glass-card stack-card dashboard-premium-grid__main">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Vendor Control Center</h2>
              <p>Everything a vendor can realistically manage is surfaced here with faster access.</p>
            </div>
          </div>

          <div className="vendor-action-grid dashboard-card-grid">
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/vendor/inventory")}>
              <span className="dashboard-card__eyebrow">Catalog</span>
              <strong>Manage Inventory</strong>
              <span>Add, edit, delete, and organize your own catalog.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/vendor/orders")}>
              <span className="dashboard-card__eyebrow">Orders</span>
              <strong>Track Orders</strong>
              <span>Review incoming orders, relevant items, and delivery progress.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/vendor/sales-analytics")}>
              <span className="dashboard-card__eyebrow">Insights</span>
              <strong>Sales Analytics</strong>
              <span>See revenue, status mix, top products, and business performance.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/vendor/profile")}>
              <span className="dashboard-card__eyebrow">Storefront</span>
              <strong>Store Profile</strong>
              <span>Update shop details, contact information, and vendor account settings.</span>
            </button>
            <button className="dashboard-card vendor-action-card dashboard-card--premium" onClick={() => navigate("/notifications")}>
              <span className="dashboard-card__eyebrow">Updates</span>
              <strong>Notifications</strong>
              <span>Stay on top of buyer activity, updates, and account events.</span>
            </button>
          </div>

          <div className="vendor-insight-grid">
            <article className="vendor-panel-card">
              <h3>Inventory Health</h3>
              <div className="vendor-stat-list">
                <div>
                  <span>Active Listings</span>
                  <strong>{overview.activeProducts}</strong>
                </div>
                <div>
                  <span>Low Stock</span>
                  <strong>{overview.lowStockProducts}</strong>
                </div>
                <div>
                  <span>Auction Exclusive</span>
                  <strong>{overview.auctionExclusive}</strong>
                </div>
                <div>
                  <span>Out of Stock</span>
                  <strong>{overview.outOfStockProducts}</strong>
                </div>
              </div>
            </article>

            <article className="vendor-panel-card">
              <h3>Business Snapshot</h3>
              <div className="vendor-stat-list">
                <div>
                  <span>Average Order Value</span>
                  <strong>Rs. {Math.round(overview.averageOrderValue).toLocaleString()}</strong>
                </div>
                <div>
                  <span>Shared Orders</span>
                  <strong>{overview.sharedOrders}</strong>
                </div>
                <div>
                  <span>Top Product</span>
                  <strong>{overview.topProduct?.product_name || "No sales yet"}</strong>
                </div>
                <div>
                  <span>Total Views</span>
                  <strong>{overview.totalViews.toLocaleString()}</strong>
                </div>
              </div>
            </article>

            <article className="vendor-panel-card">
              <h3>Store Readiness</h3>
              <div className="vendor-stat-list">
                <div>
                  <span>Inactive Listings</span>
                  <strong>{overview.inactiveProducts}</strong>
                </div>
                <div>
                  <span>Reserved for Auction</span>
                  <strong>{overview.reservedAuctionProducts}</strong>
                </div>
                <div>
                  <span>Average Rating</span>
                  <strong>{overview.averageRating ? overview.averageRating.toFixed(1) : "-"}</strong>
                </div>
              </div>
            </article>
          </div>
        </section>

        <aside className="glass-card stack-card dashboard-premium-grid__side">
          <h2 className="section-title">Quick Store Edit</h2>

          <div className="vendor-profile-badge">
            <strong>{profile?.shop_name || "Vendor Store"}</strong>
            <span>{profile?.owner_name || "Owner not set"}</span>
          </div>

          <div className="vendor-progress">
            <div className="vendor-progress__head">
              <span>Profile completion</span>
              <strong>{Math.round((profileCompletion / 5) * 100)}%</strong>
            </div>
            <div className="vendor-progress__bar">
              <span style={{ width: `${(profileCompletion / 5) * 100}%` }} />
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
              <span>Status</span>
              <strong className={`status ${statusClass}`}>{profile?.status || "PENDING"}</strong>
            </div>
          </div>

          <div className="status-panel">
            <input
              name="shop_name"
              value={form.shop_name}
              onChange={(event) => setForm((current) => ({ ...current, shop_name: event.target.value }))}
              placeholder="Shop Name"
            />
            <input
              name="owner_name"
              value={form.owner_name}
              onChange={(event) => setForm((current) => ({ ...current, owner_name: event.target.value }))}
              placeholder="Owner Name"
            />
            <input
              name="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone"
            />
            <textarea
              name="address"
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              placeholder="Business Address"
              rows={4}
            />

            <div className="cta-row">
              <button className="btn-modern hover-scale" onClick={updateProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/profile")}>
                Full Profile
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="dashboard-premium-grid">
        <section className="glass-card stack-card dashboard-premium-grid__main">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Recent Products</h2>
              <p>Quick view of the latest items you have added or updated.</p>
            </div>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/inventory")}>
              Open Inventory
            </button>
          </div>

          <div className="vendor-catalog-list">
            {recentProducts.length === 0 ? (
              <div className="empty-state vendor-empty-state">No products added yet. Start with your first listing.</div>
            ) : (
              recentProducts.map((product) => (
                <article key={product._id} className="vendor-catalog-card">
                  <div className="vendor-catalog-card__top">
                    <div>
                      <h3>{product.product_name}</h3>
                      <p>{product.category_id?.name || "Uncategorized"}</p>
                    </div>
                    <span className={`status ${product.status || "ACTIVE"}`}>
                      {product.status || "ACTIVE"}
                    </span>
                  </div>
                  <div className="vendor-catalog-card__meta">
                    <span>Rs. {Number(product.price || 0).toLocaleString()}</span>
                    <span>Stock {product.stock}</span>
                    <span>Sold {product.sold_count || 0}</span>
                    <span>Added {formatCompactDate(product.created_at)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="glass-card stack-card dashboard-premium-grid__side">
          <div className="vendor-section-head">
            <div>
              <h2 className="section-title">Recent Orders</h2>
              <p>Orders that include your products.</p>
            </div>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/orders")}>
              View All
            </button>
          </div>

          <div className="vendor-order-list">
            {recentOrders.length === 0 ? (
              <div className="empty-state vendor-empty-state">No orders tied to your products yet.</div>
            ) : (
              recentOrders.map((order) => (
                <article key={order._id} className="vendor-order-card">
                  <div className="vendor-order-card__top">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p>{order?.user_id?.username || order?.user_id?.email || "Customer"}</p>
                    </div>
                    <span className={`status ${order.status || "PENDING"}`}>
                      {order.status || "PENDING"}
                    </span>
                  </div>
                  <div className="vendor-order-card__meta">
                    <span>Items {order.relevantQuantity}</span>
                    <span>Rs. {Math.round(order.relevantTotal).toLocaleString()}</span>
                    <span>{formatCompactDate(order.createdAt)}</span>
                  </div>
                  <button className="btn-secondary-modern hover-scale" onClick={() => navigate(`/vendor/order/${order._id}`)}>
                    Open Details
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AccountConsoleShell>
  );
}
