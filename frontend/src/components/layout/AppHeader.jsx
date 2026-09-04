import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/axios";
import {
  getDashboardPath,
  getProfilePath,
  getStoredUser,
  getRole,
  getUserId
} from "../../utils/session";
import {
  clearStoredSubscription,
  getStoredSubscription,
  normalizeSubscription,
  setStoredSubscription
} from "../../utils/subscription";

const formatRoleLabel = (role = "") =>
  String(role)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getSubscriptionBadgeClass = (planName = "") => {
  const normalized = planName.toLowerCase();

  if (normalized.includes("gold")) return "is-gold";
  if (normalized.includes("silver")) return "is-silver";
  if (normalized.includes("platinum")) return "is-platinum";

  return "is-default";
};

const getNavItems = (user) => {
  const role = getRole(user);

  if (role === "VENDOR") {
    return [
      {
        to: "/vendor/dashboard",
        label: "Dashboard",
        matchPrefixes: ["/vendor/dashboard"]
      },
      {
        to: "/vendor/inventory",
        label: "Inventory",
        matchPrefixes: ["/vendor/inventory"]
      },
      {
        to: "/vendor/orders",
        label: "Orders",
        matchPrefixes: ["/vendor/orders", "/vendor/order"]
      },
      {
        to: "/vendor/sales-analytics",
        label: "Analytics",
        matchPrefixes: ["/vendor/sales-analytics"]
      },
      { to: "/notifications", label: "Notifications", isNotification: true }
    ];
  }

  if (["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role)) {
    const items = [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        matchPrefixes: ["/admin/dashboard"]
      },
      {
        to: "/admin/productDashboard",
        label: "Products",
        matchPrefixes: ["/admin/productDashboard", "/admin/products"]
      },
      {
        to: "/admin/category",
        label: "Categories",
        matchPrefixes: ["/admin/category"]
      },
      {
        to: "/admin/orders-dashboard",
        label: "Orders",
        matchPrefixes: ["/admin/orders-dashboard", "/admin/orders", "/admin/order"]
      },
      {
        to: "/admin/vendors",
        label: "Vendors",
        matchPrefixes: ["/admin/vendors", "/admin/vendor-approval"]
      },
      {
        to: "/admin/customers",
        label: "Customers",
        matchPrefixes: ["/admin/customers"]
      }
    ];

    if (role === "SUPER_ADMIN") {
      items.push({
        to: "/admin/auction-dashboard",
        label: "Auction",
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
      });
    }

    return items;
  }

  if (role === "CUSTOMER") {
    return [
      {
        to: "/customer/dashboard",
        label: "Dashboard",
        matchPrefixes: ["/customer/dashboard"]
      },
      {
        to: "/wallet",
        label: "Wallet",
        matchPrefixes: ["/wallet"]
      },
      {
        to: "/auction/join",
        label: "Auction",
        matchPrefixes: ["/auction"]
      },
      {
        to: "/orders",
        label: "Orders",
        matchPrefixes: ["/orders", "/order"]
      },
      {
        to: "/cart",
        label: "Cart",
        matchPrefixes: ["/cart"]
      },
      {
        to: "/subscriptions",
        label: "Subscriptions",
        matchPrefixes: ["/subscriptions", "/subscription"]
      },
      { to: "/notifications", label: "Notifications", isNotification: true }
    ];
  }

  return [];
};

const isNavItemActive = (pathname, item) => {
  if (pathname === item.to) {
    return true;
  }

  const matchPrefixes = item.matchPrefixes?.length ? item.matchPrefixes : [item.to];

  return matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export default function AppHeader() {
  const location = useLocation();
  const [user, setUser] = useState(() => getStoredUser());
  const [notifCount, setNotifCount] = useState(0);
  const [activeSubscription, setActiveSubscription] = useState(() => {
    const storedUser = getStoredUser();
    return (
      getStoredSubscription() ||
      normalizeSubscription(storedUser?.subscription) ||
      normalizeSubscription(storedUser?.plan_name)
    );
  });

  const role = getRole(user);
  const userId = getUserId(user);
  const dashboardPath = getDashboardPath(user);
  const profilePath = getProfilePath(user);
  const navItems = getNavItems(user);
  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === dashboardPath;
  const profileLabel = user?.nickname || user?.username || user?.email || "Guest";
  const subscriptionLabel = activeSubscription?.plan || "";
  const subscriptionBadgeClass = getSubscriptionBadgeClass(subscriptionLabel);

  useEffect(() => {
    const syncHeaderState = () => {
      const nextUser = getStoredUser();
      setUser(nextUser);
      setActiveSubscription(
        getStoredSubscription() ||
          normalizeSubscription(nextUser?.subscription) ||
          normalizeSubscription(nextUser?.plan_name)
      );
    };

    syncHeaderState();
    window.addEventListener("storage", syncHeaderState);
    window.addEventListener("session-updated", syncHeaderState);
    window.addEventListener("subscription-updated", syncHeaderState);

    return () => {
      window.removeEventListener("storage", syncHeaderState);
      window.removeEventListener("session-updated", syncHeaderState);
      window.removeEventListener("subscription-updated", syncHeaderState);
    };
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    if (!userId) {
      setNotifCount(0);
      return;
    }

    let active = true;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get(`/notifications/unread-count/${userId}`);
        if (active) {
          setNotifCount(Number(res.data?.unreadCount || 0));
        }
      } catch {
        if (active) {
          setNotifCount(0);
        }
      }
    };

    fetchUnreadCount();

    return () => {
      active = false;
    };
  }, [location.pathname, userId]);

  useEffect(() => {
    if (role !== "CUSTOMER" || !userId) {
      setActiveSubscription(null);
      clearStoredSubscription();
      return;
    }

    let active = true;

    const fetchSubscription = async () => {
      try {
        const res = await api.get(`/subscription/user/${userId}`);
        const nextPlan = normalizeSubscription(res.data?.current || null);

        if (!active) {
          return;
        }

        setActiveSubscription(nextPlan);

        if (nextPlan) {
          setStoredSubscription(nextPlan);
        } else {
          clearStoredSubscription();
        }
      } catch {
        if (!active) {
          return;
        }

        setActiveSubscription(null);
      }
    };

    fetchSubscription();

    return () => {
      active = false;
    };
  }, [role, userId]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <Link to="/" className="app-header__logo">
            Shadow Monarch
          </Link>
          <span className="app-header__tag">
            Luxury store and live auction
          </span>
        </div>

        <nav className="app-header__nav">
          {!isHome && <Link to="/">Home</Link>}

          {user ? (
            navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isNavItemActive(location.pathname, item) ? "is-active" : ""}
              >
                {item.label}
                {item.isNotification && notifCount > 0 ? (
                  <span className="app-header__notification-badge">{notifCount}</span>
                ) : null}
              </Link>
            ))
          ) : (
            <>
              <Link to="/customer/login">Customer Login</Link>
              <Link to="/vendor/login">Vendor Login</Link>
              <Link to="/admin/login">Admin Login</Link>
            </>
          )}
        </nav>

        <div className="app-header__actions">
          <div className="app-header__profile">
            <div className="app-header__profile-topline">
              <span className="app-header__profile-name">{profileLabel}</span>
              {subscriptionLabel ? (
                <span className={`app-header__subscription-badge ${subscriptionBadgeClass}`}>
                  {subscriptionLabel}
                </span>
              ) : null}
            </div>
            <span className="app-header__profile-role">
              {user ? formatRoleLabel(user?.role) : "Browse the marketplace"}
            </span>
          </div>

          {user ? (
            <div className="app-header__shortcut-group">
              <Link
                to={profilePath}
                className={`app-header__shortcut btn-secondary-modern hover-scale ${
                  location.pathname === profilePath ? "is-disabled" : ""
                }`}
                onClick={(event) => {
                  if (location.pathname === profilePath) event.preventDefault();
                }}
              >
                Profile
              </Link>
              <Link
                to={dashboardPath}
                className={`app-header__shortcut btn-modern hover-scale ${
                  isDashboard ? "is-disabled" : ""
                }`}
                onClick={(event) => {
                  if (isDashboard) event.preventDefault();
                }}
              >
                Dashboard
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
