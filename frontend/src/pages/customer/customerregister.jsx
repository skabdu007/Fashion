import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import "../../styles/gopal.css";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    username: "",
    nickname: "",
    email: "",
    address: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: ""
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

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/customer/register", {
        username: form.username,
        nickname: form.nickname,
        email: form.email,
        address: form.address,
        phone: form.phone,
        dob: form.dob,
        password: form.password
      });

      if (res.data.success) {
        toast.success("Customer registered successfully.");
        navigate("/customer/login");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card slide-up-card">
        <h2>Customer Register</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <InlineAlert message={formError} />
          <input name="username" placeholder="Username" onChange={handleChange} required />
          <input name="nickname" placeholder="Nickname" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input name="address" placeholder="Address" onChange={handleChange} />
          <input name="phone" placeholder="Phone" onChange={handleChange} />
          <input type="date" name="dob" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          <button type="submit" className="register-btn hover-scale" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="login-text">
            Already have an account?
            <Link to="/customer/login"> Login Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
