import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction } from "../../utils/alerts";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function VendorApproval() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/admin/vendors");
      const pending = (res.data?.data || []).filter((v) => v.status === "PENDING");
      setVendors(pending);
    } catch (err) {
      console.error("ERROR:", err.response || err.message);

      if (err.response?.status === 401) {
        setError("Unauthorized - Admin login required");
        return;
      }

      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const approveVendor = async (id) => {
    try {
      const confirmation = await confirmAction({
        title: "Approve vendor?",
        text: "The vendor will gain access to the platform.",
        confirmButtonText: "Approve vendor",
        icon: "question"
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await api.patch(`/admin/vendor/${id}/approve`);
      toast.success("Vendor approved successfully.");
      loadVendors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Approve failed");
    }
  };

  const rejectVendor = async (id) => {
    try {
      const confirmation = await confirmAction({
        title: "Reject vendor?",
        text: "The vendor will be blocked from accessing the platform.",
        confirmButtonText: "Reject vendor"
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await api.patch(`/admin/vendor/${id}/block`);
      toast.warning("Vendor rejected and blocked.");
      loadVendors();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Reject failed");
    }
  };

  return (
    <div className="admin-main fade-in-page">
      <h2>Vendor Approval</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <LoadingSpinner centered label="Loading vendors..." />
      ) : vendors.length === 0 ? (
        <p>No pending vendors</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Owner</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td>{v.shop_name}</td>
                <td>{v.owner_name}</td>
                <td>{v.email}</td>
                <td>
                  <button className="btn approve hover-scale" onClick={() => approveVendor(v._id)}>
                    Approve
                  </button>
                  <button className="btn reject hover-scale" onClick={() => rejectVendor(v._id)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
