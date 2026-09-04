import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";

export default function JoinRoom() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.user_id || user?._id;

  useEffect(() => {
    const presetCode = searchParams.get("code");
    if (presetCode) {
      setCode(presetCode);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setCheckingAccess(false);
        return;
      }

      try {
        const res = await api.get(`/subscription/user/${userId}`);
        setSubscription(res.data.current || null);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAccess(false);
      }
    };

    loadSubscription();
  }, [userId]);

  const join = async () => {
    try {
      if (!code) {
        const message = "Please enter room code.";
        setError(message);
        toast.warning(message);
        return;
      }

      if (user?.role?.toUpperCase() !== "CUSTOMER") {
        const message = "Only customer accounts can join premium auction rooms.";
        setError(message);
        toast.error(message);
        return;
      }

      if (subscription?.plan !== "PLATINUM" || subscription?.status !== "ACTIVE") {
        const message = "Only customers with an active platinum subscription can join rooms.";
        setError(message);
        toast.error(message);
        return;
      }

      setLoading(true);
      setError("");

      const res = await api.post("/auction/join-room", {
        room_code: code
      });

      toast.success("Access granted. Joining room...");
      navigate(`/auction/${res.data.auction_id}`);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Invalid room code";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="glass-card stack-card" style={{ maxWidth: "720px", margin: "40px auto" }}>
          <div className="premium-badge" style={{ marginBottom: "18px" }}>
            Platinum Members Only
          </div>

          <h1 style={{ textAlign: "left", marginBottom: "8px" }}>Join Auction Room</h1>
          <p style={{ marginBottom: "20px" }}>
            Only users with an active platinum subscription can join premium rooms.
          </p>

          {checkingAccess ? (
            <div className="info-banner" style={{ marginBottom: "16px" }}>
              <LoadingSpinner label="Verifying your subscription access..." />
            </div>
          ) : subscription?.plan === "PLATINUM" && subscription?.status === "ACTIVE" ? (
            <div className="success-banner" style={{ marginBottom: "16px" }}>
              Platinum access confirmed. You can join invited rooms.
            </div>
          ) : (
            <div className="warning-banner" style={{ marginBottom: "16px" }}>
              Your current account does not have active platinum access.
            </div>
          )}

          {error ? <div className="error-banner" style={{ marginBottom: "16px" }}>{error}</div> : null}

          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
          />

          <div className="cta-row">
            <button className="btn-modern hover-scale" onClick={join} disabled={loading || checkingAccess}>
              {loading ? "Checking access..." : "Join Room"}
            </button>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/subscription")}>
              View Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
