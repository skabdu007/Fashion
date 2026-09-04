import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function AdminRegister() {
  const navigate = useNavigate();
  const toast = useToast();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    phone: "",
    email: "",
    role: "ADMIN",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.username || !form.email || !form.password) {
      return "All required fields must be filled.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setFormError(error);
      toast.error(error);
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const res = await api.post("/admin/register", {
        username: form.username,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        role: form.role,
        password: form.password
      });

      if (res.data.success) {
        toast.success("Admin registered successfully 🎉");
        navigate("/admin/login");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-login-container">
      <div className="admin-login-card slide-up-card">

        <h2>Admin Register</h2>

        <form onSubmit={handleSubmit}>

          <InlineAlert message={formError} />

          {/* INPUTS */}
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />

          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          {/* ROLE SELECT */}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
             <option value="SUPER_ADMIN">Super Admin</option>
            {/* ONLY SUPER ADMIN CAN CREATE SUPER ADMIN */}
            {currentUser?.role === "SUPER_ADMIN" && (
              <option value="SUPER_ADMIN">Super Admin</option>
            )}
          </select>

          {/* PASSWORD */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="admin-login-btn hover-scale"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p style={{ marginTop: "15px" }}>
          Already have an account?
          <Link to="/admin/login"> Login</Link>
        </p>

      </div>
    </div>
  );
}