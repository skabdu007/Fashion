import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";

export default function AddCustomer() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    username: "",
    nickname: "",
    email: "",
    address: "",
    phone: "",
    dob: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/customer/register", form);
      toast.success("Customer added successfully.");
      navigate("/admin/customers/all");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to add customer";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Add Customer</h2>
      <form onSubmit={handleSubmit}>
        <InlineAlert message={error} />
        <input name="username" placeholder="Name" onChange={handleChange} />
        <input name="nickname" placeholder="Nickname" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input type="date" name="dob" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} />
        <button className="hover-scale" type="submit">Save</button>
      </form>
    </div>
  );
}
