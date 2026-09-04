import { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function BlockedVendors() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/vendors");
        const blocked = (res.data.data || []).filter(
          (v) => v.status?.toUpperCase() === "BLOCKED"
        );

        setVendors(blocked);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-main">
      <h2>Blocked Vendors</h2>

      {vendors.length === 0 ? (
        <p>No blocked vendors</p>
      ) : (
        vendors.map((v) => (
          <p key={v._id}>
            {v.shop_name} - {v.owner_name}
          </p>
        ))
      )}
    </div>
  );
}
