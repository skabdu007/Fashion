import { useMemo } from "react";
import { NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import "../../styles/gopal.css";

const runAction = (navigate, action) => {
  if (!action) return;
  if (typeof action.onClick === "function") {
    action.onClick();
    return;
  }
  if (action.path) {
    navigate(action.path);
  }
};

const ADMIN_NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    caption: "Overview and quick control",
    path: "/admin/dashboard",
    matchPrefixes: ["/admin/dashboard"]
  },
  {
    key: "products",
    label: "Products",
    caption: "Catalog, stock, and analytics",
    path: "/admin/productDashboard",
    matchPrefixes: ["/admin/productDashboard", "/admin/products"]
  },
  {
    key: "categories",
    label: "Categories",
    caption: "Organize your catalog structure",
    path: "/admin/category",
    matchPrefixes: ["/admin/category"]
  },
  {
    key: "customers",
    label: "Customers",
    caption: "Accounts and customer health",
    path: "/admin/customers",
    matchPrefixes: ["/admin/customers"]
  },
  {
    key: "vendors",
    label: "Vendors",
    caption: "Approvals and partner management",
    path: "/admin/vendors",
    matchPrefixes: ["/admin/vendors", "/admin/vendor-approval"]
  },
  {
    key: "orders",
    label: "Orders",
    caption: "Fulfillment and status tracking",
    path: "/admin/orders-dashboard",
    matchPrefixes: ["/admin/orders-dashboard", "/admin/orders", "/admin/order"]
  }
];

const AUCTION_NAV_ITEM = {
  key: "auction",
  label: "Auction",
  caption: "Rooms, hosting, winners, and live ops",
  path: "/admin/auction-dashboard",
  matchPrefixes: [
    "/admin/auction-dashboard",
    "/admin/auction",
    "/admin/create-auction-room",
    "/admin/rooms",
    "/admin/hosting",
    "/admin/hosting-manager",
    "/admin/live-bidding",
    "/admin/live-auction",
    "/admin/winners"
  ]
};

const isNavItemActive = (pathname, activeKey, item) => {
  if (activeKey && item.key === activeKey) {
    return true;
  }

  return item.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export default function AdminConsoleShell({
  activeKey,
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  if (!admin || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(admin.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const navItems = useMemo(() => {
    const items = [...ADMIN_NAV_ITEMS];

    if (admin?.role === "SUPER_ADMIN") {
      items.push(AUCTION_NAV_ITEM);
    }

    return items;
  }, [admin?.role]);

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container dashboard-console dashboard-console--shell">
        <aside className="glass-card console-sidebar">
          <div className="console-sidebar__brand">
            <span className="console-sidebar__eyebrow">Admin Workspace</span>
            <strong>{admin.username || admin.email || "Administrator"}</strong>
            <p>{admin.role}</p>
          </div>

          <nav className="console-sidebar__nav" aria-label="Admin sections">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={`console-sidebar__link ${
                  isNavItemActive(location.pathname, activeKey, item)
                    ? "is-active"
                    : ""
                }`}
              >
                <span className="console-sidebar__link-label">{item.label}</span>
                <span className="console-sidebar__link-caption">
                  {item.caption}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="console-sidebar__footer">
            <button
              className="btn-secondary-modern hover-scale console-sidebar__logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="console-main">
          <section className="shop-hero vendor-hero dashboard-console__hero">
            <div className="dashboard-console__copy">
              <div className="dashboard-hero__badge-row">
                <div className="premium-badge">{badge || admin.role}</div>
                <span className="dashboard-hero__meta">
                  {admin.username || admin.email}
                </span>
              </div>
              <h1>{title}</h1>
              <p>{description}</p>
              <div className="dashboard-hero__meta">
                Signed in as {admin.username || admin.email} | Role:{" "}
                {admin.role}
              </div>
            </div>

            <div className="dashboard-console__actions">
              {secondaryAction ? (
                <button
                  className="btn-secondary-modern hover-scale"
                  onClick={() => runAction(navigate, secondaryAction)}
                >
                  {secondaryAction.label}
                </button>
              ) : null}
              {primaryAction ? (
                <button
                  className="btn-modern hover-scale"
                  onClick={() => runAction(navigate, primaryAction)}
                >
                  {primaryAction.label}
                </button>
              ) : null}
            </div>
          </section>

          {children}
        </div>
      </div>
    </div>
  );
}
