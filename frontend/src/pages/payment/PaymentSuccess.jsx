import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h2>Payment Successful</h2>

      <button onClick={() => navigate("/")}>
        Go to Home
      </button>
    </div>
  );
}