export default function LoadingSpinner({ label = "Loading...", centered = false, size = "md" }) {
  return (
    <div className={`loading-wrap ${centered ? "loading-wrap-centered" : ""}`}>
      <span className={`loading-spinner loading-spinner-${size}`} aria-hidden="true" />
      <span className="loading-label">{label}</span>
    </div>
  );
}
