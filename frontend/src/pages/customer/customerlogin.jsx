import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.email.trim() || !form.password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/customer/login", form);

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: "CUSTOMER",
          user_id: res.data.customer._id,
          username: res.data.customer.username,
          email: res.data.customer.email
        })
      );

      toast.success("Login successful. Welcome back.");
      navigate("/customer/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-container">
      <div className="customer-login-card slide-up-card">
        <h2>Customer Login</h2>

        <form onSubmit={handleSubmit}>
          <InlineAlert message={formError} />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="customer-login-btn hover-scale" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button className="customer-back-btn hover-scale" onClick={() => navigate("/")}>
          Back to Home
        </button>

        <p className="customer-register-text">
          Don't have an account?
          <Link to="/customer/register"> Register Here</Link>
        </p>
      </div>
    </div>
  );
}
