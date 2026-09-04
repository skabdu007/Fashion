import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { broadcastSessionUpdate, getStoredUser } from "../../utils/session";

export default function AdminProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const admin = useMemo(() => getStoredUser(), []);
  const [form, setForm] = useState({
    username: admin?.username || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    full_name: admin?.full_name || ""
  });
  const [saving, setSaving] = useState(false);

  if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/admin/${admin.id}`, form);
      const updatedAdmin = res.data.data || { ...admin, ...form };

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...admin,
          ...updatedAdmin,
          id: updatedAdmin._id || admin.id
        })
      );
      broadcastSessionUpdate();

      toast.success("Admin profile updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <div className="shop-hero">
          <div>
            <h1>Admin Profile</h1>
            <p>Keep your account details current and maintain a cleaner admin identity across dashboard workflows.</p>
          </div>
          <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div className="checkout-layout">
          <section className="glass-card stack-card">
            <h2 className="section-title">Profile Settings</h2>
            <div className="status-panel">
              <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" />

              <button className="btn-modern hover-scale" onClick={updateProfile} disabled={saving}>
                {saving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </section>

          <aside className="glass-card stack-card">
            <h2 className="section-title">Admin Summary</h2>
            <div className="summary-grid">
              <div className="summary-tile">
                <div className="summary-label">Role</div>
                <div className="summary-value" style={{ fontSize: "20px" }}>{admin.role}</div>
              </div>
              <div className="summary-tile">
                <div className="summary-label">Status</div>
                <div className="summary-value" style={{ fontSize: "20px" }}>{admin.status || "ACTIVE"}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
