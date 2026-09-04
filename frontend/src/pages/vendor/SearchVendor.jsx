import { useMemo, useState } from "react";
import axios from "axios";

export default function SearchVendor() {
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => vendors || [], [vendors]);

  const search = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/vendor/search?q=${q}`);
      setVendors(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell">
      <div className="shop-container">
        <div className="glass-card stack-card">
          <div className="shop-hero" style={{ marginBottom: "20px" }}>
            <div>
              <h1>Search Vendors</h1>
              <p>Quickly find vendor accounts by shop name.</p>
            </div>
          </div>

          <div className="flex-between" style={{ gap: "12px", alignItems: "stretch", marginBottom: "20px" }}>
            <input
              placeholder="Search by shop or owner"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ marginBottom: 0 }}
            />

            <button className="btn-modern" onClick={search} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length === 0 ? (
            <div className="empty-state">No vendors found yet.</div>
          ) : (
            <div className="line-items">
              {results.map((v) => (
                <article className="line-item" key={v._id}>
                  <div>
                    <div className="line-item-title">{v.shop_name}</div>
                    <div className="line-item-meta">{v.owner_name} • {v.email}</div>
                  </div>

                  <span className={`status ${v.status === "APPROVED" ? "DELIVERED" : v.status === "BLOCKED" ? "CANCELLED" : "PENDING"}`}>
                    {v.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
