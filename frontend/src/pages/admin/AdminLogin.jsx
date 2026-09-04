import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import "../../styles/gopal.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await axios.post("/admin/login", form);

      if (res.data.success) {
        const { accessToken, admin } = res.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          })
        );

        toast.success("Admin login successful.");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card slide-up-card">
        <h2>Admin Login</h2>

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

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" className="admin-login-btn hover-scale" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button className="back-home-btn hover-scale" onClick={() => navigate("/")}>
          Back to Home
        </button>

        <p className="customer-register-text">
          Don't have account?
          <Link to="/admin/register"> Register Here</Link>
        </p>
      </div>
    </div>
  );
}
