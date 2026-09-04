import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function VendorLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.email.trim() || !form.password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/vendor/login", form);

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("vendor", JSON.stringify(res.data.vendor));
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: "VENDOR",
          user_id: res.data.vendor?._id,
          username: res.data.vendor?.owner_name,
          email: res.data.vendor?.email
        })
      );

      toast.success("Vendor login successful.");
      navigate("/vendor/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-container">
      <div className="vendor-card slide-up-card">
        <h2>Vendor Login</h2>

        <form onSubmit={handleSubmit}>
          <InlineAlert message={formError} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit" className="vendor-btn hover-scale" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don't have account?
          <Link to="/vendor/register"> Register Here</Link>
        </p>
      </div>
    </div>
  );
}
