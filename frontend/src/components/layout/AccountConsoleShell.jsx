import { NavLink, useLocation, useNavigate } from "react-router-dom";
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

const isNavItemActive = (pathname, activeKey, item) => {
  if (activeKey && item.key === activeKey) {
    return true;
  }

  const matchPrefixes = item.matchPrefixes?.length ? item.matchPrefixes : [item.path];

  return matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export default function AccountConsoleShell({
  panelTitle,
  panelSubtitle,
  navItems,
  activeKey,
  badge,
  userLabel,
  title,
  description,
  meta,
  secondaryAction,
  primaryAction,
  onLogout,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const visibleNavItems = Array.isArray(navItems) ? navItems : [];

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container dashboard-console dashboard-console--shell">
        <aside className="glass-card console-sidebar">
          <div className="console-sidebar__brand">
            <span className="console-sidebar__eyebrow">
              {panelTitle || "Workspace"}
            </span>
            <strong>{userLabel || panelSubtitle || "Workspace"}</strong>
            <p>{badge || panelSubtitle || "Control center"}</p>
          </div>

          <nav className="console-sidebar__nav" aria-label="Workspace sections">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.key || item.path}
                to={item.path}
                className={`console-sidebar__link ${
                  isNavItemActive(location.pathname, activeKey, item)
                    ? "is-active"
                    : ""
                }`}
              >
                <span className="console-sidebar__link-label">
                  {item.label}
                </span>
                <span className="console-sidebar__link-caption">
                  {item.caption || item.helper || item.path}
                </span>
              </NavLink>
            ))}
          </nav>

          {onLogout ? (
            <div className="console-sidebar__footer">
              <button
                className="btn-secondary-modern hover-scale console-sidebar__logout"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </aside>

        <div className="console-main">
          <section className="shop-hero vendor-hero dashboard-console__hero">
            <div className="dashboard-console__copy">
              <div className="dashboard-hero__badge-row">
                <div className="premium-badge">
                  {badge || panelTitle || "Workspace"}
                </div>
                <span className="dashboard-hero__meta">
                  {userLabel || panelSubtitle || "Workspace"}
                </span>
              </div>
              <h1>{title}</h1>
              <p>{description}</p>
              {meta ? <div className="dashboard-hero__meta">{meta}</div> : null}
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
