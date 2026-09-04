import { Link } from "react-router-dom";
import { getDashboardPath, getProfilePath, getRole, getStoredUser } from "../../utils/session";

const getFooterLinks = (user) => {
  const role = getRole(user);

  if (role === "VENDOR") {
    return [
      { to: "/", label: "Home" },
      { to: "/vendor/dashboard", label: "Dashboard" },
      { to: "/vendor/inventory", label: "Inventory" },
      { to: "/vendor/orders", label: "Orders" },
      { to: "/vendor/sales-analytics", label: "Analytics" }
    ];
  }

  if (["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role)) {
    return [
      { to: "/", label: "Home" },
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/productDashboard", label: "Products" },
      { to: "/admin/orders-dashboard", label: "Orders" },
      { to: "/admin/vendors", label: "Vendors" }
    ];
  }

  if (role === "CUSTOMER") {
    return [
      { to: "/", label: "Home" },
      { to: "/wallet", label: "Wallet" },
      { to: "/auction/join", label: "Auction" },
      { to: "/orders", label: "Orders" },
      { to: "/cart", label: "Cart" }
    ];
  }

  return [
    { to: "/", label: "Home" },
    { to: "/customer/login", label: "Customer Login" },
    { to: "/vendor/login", label: "Vendor Login" },
    { to: "/admin/login", label: "Admin Login" }
  ];
};

export default function AppFooter() {
  const user = getStoredUser();
  const dashboardPath = getDashboardPath(user);
  const profilePath = getProfilePath(user);
  const links = getFooterLinks(user);

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <strong>Shadow Monarch</strong>
          <p>Shopping, wallet, vendor operations, and live bidding in one place.</p>
        </div>

        <div className="app-footer__links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}

          {user ? <Link to={profilePath}>Profile</Link> : null}
          {user ? <Link to={dashboardPath}>Workspace</Link> : null}
        </div>

        <div className="app-footer__meta">
          <span>Premium commerce experience</span>
          <span>{new Date().getFullYear()} Shadow Monarch</span>
        </div>
      </div>
    </footer>
  );
}
