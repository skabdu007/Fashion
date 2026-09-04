import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import WorkspaceContextBar from "./WorkspaceContextBar";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <AppHeader />
      <WorkspaceContextBar />
      <main className="app-shell__content">{children}</main>
      <AppFooter />
    </div>
  );
}
