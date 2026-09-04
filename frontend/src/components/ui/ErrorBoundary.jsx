import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ui] unhandled render error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="shop-shell">
          <div className="shop-container">
            <div className="glass-card stack-card" style={{ maxWidth: "720px", margin: "40px auto" }}>
              <h1>Something went wrong</h1>
              <p>The page crashed unexpectedly, but the app is still safe. Reload the page and try again.</p>
              <div className="error-banner" style={{ marginBottom: "16px" }}>
                {this.state.error?.message || "Unexpected UI error"}
              </div>
              <button type="button" className="btn-modern" onClick={this.handleReload}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
