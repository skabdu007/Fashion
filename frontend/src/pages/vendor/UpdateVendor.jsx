import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";

export default function UpdateVendor() {
  const { id } = useParams();
  const toast = useToast();
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/vendor/${id}`).then((res) => setForm(res.data.data));
  }, [id]);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const update = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.put(`/vendor/${id}`, form);
      toast.success("Vendor updated successfully.");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to update vendor";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Update Vendor</h2>
      <form onSubmit={update}>
        <InlineAlert message={error} />
        <input name="shop_name" value={form.shop_name || ""} onChange={change} />
        <input name="owner_name" value={form.owner_name || ""} onChange={change} />
        <input name="email" value={form.email || ""} onChange={change} />
        <input name="phone" value={form.phone || ""} onChange={change} />
        <button className="hover-scale" type="submit">Update</button>
      </form>
    </div>
  );
}
