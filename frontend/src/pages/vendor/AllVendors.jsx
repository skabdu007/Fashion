import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import { confirmAction } from "../../utils/alerts";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function AllVendors() {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/admin/vendors");
      const data = res.data?.data || [];

      setVendors(data);
      setFiltered(data);
    } catch (err) {
      console.error("LOAD ERROR:", err?.response || err.message);
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    const result = vendors.filter((v) =>
      v.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, vendors]);

  const deleteVendor = async (id) => {
    try {
      const confirmation = await confirmAction({
        title: "Delete vendor?",
        text: "This action will permanently remove the vendor account.",
        confirmButtonText: "Delete vendor"
      });

      if (!confirmation.isConfirmed) return;

      await api.delete(`/vendor/${id}`);
      toast.success("Vendor deleted successfully.");
      loadVendors();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const blockVendor = async (id) => {
    try {
      await api.patch(`/admin/vendor/${id}/block`);
      toast.success("Vendor blocked successfully.");
      loadVendors();
    } catch (err) {
      console.error("BLOCK ERROR:", err);
      toast.error(err.response?.data?.message || "Block failed");
    }
  };

  return (
    <div className="admin-container fade-in-page">
      <h1 className="title">Vendor Management</h1>

      <div className="stats">
        <div className="card hover-lift"><h3>Total Vendors</h3><p>{vendors.length}</p></div>
        <div className="card hover-lift"><h3>Active</h3><p>{vendors.filter((v) => v.status !== "BLOCKED").length}</p></div>
        <div className="card hover-lift"><h3>Blocked</h3><p>{vendors.filter((v) => v.status === "BLOCKED").length}</p></div>
      </div>

      <input
        className="search"
        placeholder="Search by shop / owner / email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <div className="table-wrapper">
        {loading ? (
          <LoadingSpinner centered label="Loading vendors..." />
        ) : filtered.length === 0 ? (
          <div className="center-msg">No vendors found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => (
                <tr key={v._id}>
                  <td>{v.shop_name}</td>
                  <td>{v.owner_name}</td>
                  <td>{v.email}</td>
                  <td>
                    <span className={`badge ${v.status === "BLOCKED" ? "red" : "green"}`}>
                      {v.status}
                    </span>
                  </td>

                  <td>
                    <button className="btn edit hover-scale" onClick={() => navigate(`/admin/vendors/update/${v._id}`)}>
                      Edit
                    </button>
                    <button className="btn delete hover-scale" onClick={() => deleteVendor(v._id)}>
                      Delete
                    </button>
                    <button
                      className="btn block hover-scale"
                      disabled={v.status === "BLOCKED"}
                      onClick={() => blockVendor(v._id)}
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
