import { useState } from "react";
import axios from "axios";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import "../../styles/gopal.css";

export default function AddVendor() {
  const toast = useToast();
  const [form, setForm] = useState({
    shop_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/vendor/register", form);
      toast.success("Vendor added successfully.");
      setForm({
        shop_name: "",
        owner_name: "",
        email: "",
        phone: "",
        address: "",
        password: ""
      });
    } catch (err) {
      const message = err.response?.data?.message || "Unable to add vendor";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Add Vendor</h2>
      <form onSubmit={submit}>
        <InlineAlert message={error} />
        <input name="shop_name" placeholder="Shop Name" value={form.shop_name} onChange={handleChange} />
        <input name="owner_name" placeholder="Owner Name" value={form.owner_name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <button className="hover-scale" type="submit">Save</button>
      </form>
    </div>
  );
}
