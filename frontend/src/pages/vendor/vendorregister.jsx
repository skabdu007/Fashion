import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import "../../styles/gopal.css";

export default function VendorRegister() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    shop_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
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

    try {
      setLoading(true);
      await axios.post("/vendor/register", form);
      toast.success("Registered successfully. Waiting for admin approval.");
      navigate("/vendor/login");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-container">
      <div className="vendor-card slide-up-card">
        <h2>Vendor Register</h2>

        <form onSubmit={handleSubmit}>
          <InlineAlert message={formError} />
          <input name="shop_name" placeholder="Shop Name" onChange={handleChange} required />
          <input name="owner_name" placeholder="Owner Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input name="phone" placeholder="Phone" onChange={handleChange} />
          <input name="address" placeholder="Address" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit" className="vendor-btn hover-scale" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>
          Already have account?
          <Link to="/vendor/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}
