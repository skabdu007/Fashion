import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getDashboardPath,
  getProfilePath,
  getRole,
  getStoredUser
} from "../../utils/session";

const AUTH_PAGES = new Set([
  "/",
  "/customer/login",
  "/customer/register",
  "/vendor/login",
  "/vendor/register",
  "/admin/login",
  "/admin/register"
]);

const PAGE_TITLES = {
  "/orders": "My Orders",
  "/wallet": "Wallet",
  "/wallet/add-money": "Add Money",
  "/wallet/history": "Wallet History",
  "/wallet/bank-account": "Bank Account",
  "/notifications": "Notifications",
  "/subscriptions": "Membership Plans",
  "/subscription": "Membership Plans",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/customer/profile": "Customer Profile",
  "/vendor/profile": "Vendor Profile",
  "/vendor/inventory": "Vendor Inventory",
  "/vendor/orders": "Vendor Orders",
  "/vendor/sales-analytics": "Vendor Analytics",
  "/admin/profile": "Admin Profile",
  "/admin/productDashboard": "Product Dashboard",
  "/admin/orders-dashboard": "Order Dashboard",
  "/admin/vendors": "Vendor Control",
  "/admin/customers": "Customer Control",
  "/admin/category": "Categories",
  "/admin/auction-dashboard": "Auction Dashboard",
  "/auction/join": "Join Auction",
  "/payment": "Payment",
  "/payment/processing": "Payment Processing",
  "/payment/success": "Payment Success",
  "/payment/failed": "Payment Failed"
};

const getDynamicTitle = (pathname) => {
  if (pathname.startsWith("/order/") && pathname !== "/orders") {
    return pathname.startsWith("/order/cancel/") ? "Cancel Order" : "Order Details";
  }

  if (pathname.startsWith("/vendor/order/")) {
    return "Vendor Order Details";
  }

  if (pathname.startsWith("/products/")) {
    return "Product Details";
  }

  if (pathname.startsWith("/admin/orders/update/")) {
    return "Update Order Status";
  }

  if (pathname.startsWith("/admin/orders/")) {
    return "Admin Orders";
  }

  if (pathname.startsWith("/admin/vendors/update/")) {
    return "Update Vendor";
  }

  if (pathname.startsWith("/admin/customers/update/")) {
    return "Update Customer";
  }

  return "";
};

const formatLabelFromPath = (pathname) =>
  pathname
    .split("/")
    .filter(Boolean)
    .slice(-1)[0]
    ?.replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase()) || "Workspace";

const shouldShowWorkspaceBar = (pathname, dashboardPath, user) => {
  if (!user || AUTH_PAGES.has(pathname) || pathname === dashboardPath) {
    return false;
  }

  return true;
};

export default function WorkspaceContextBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const dashboardPath = getDashboardPath(user);
  const profilePath = getProfilePath(user);
  const role = getRole(user);

  if (!shouldShowWorkspaceBar(location.pathname, dashboardPath, user)) {
    return null;
  }

  const resolvedTitle = PAGE_TITLES[location.pathname] || getDynamicTitle(location.pathname) || formatLabelFromPath(location.pathname);
  const workspaceLabel =
    role === "CUSTOMER"
      ? "Customer Workspace"
      : role === "VENDOR"
        ? "Vendor Workspace"
        : "Admin Workspace";

  return (
    <div className="workspace-context-bar">
      <div className="workspace-context-bar__inner">
        <div className="workspace-context-bar__copy">
          <span className="workspace-context-bar__eyebrow">{workspaceLabel}</span>
          <strong>{resolvedTitle}</strong>
        </div>

        <div className="workspace-context-bar__actions">
          <button
            type="button"
            className="btn-secondary-modern hover-scale"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <Link to={profilePath} className="btn-secondary-modern hover-scale">
            Profile
          </Link>
          <Link to={dashboardPath} className="btn-modern hover-scale">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
