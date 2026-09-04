export default function InlineAlert({ type = "error", message, className = "" }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`inline-alert inline-alert-${type} ${className}`.trim()} role="alert">
      {message}
    </div>
  );
}
