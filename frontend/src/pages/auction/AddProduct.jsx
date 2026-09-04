import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import { useAuctionFlow } from "../../context/AuctionFlowContext";
import api from "../../utils/axios";
import "../../styles/gopal.css";

const emptyForm = {
  vendor_id: "",
  product_name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  image: null
};

export default function AuctionAddProduct() {
  const navigate = useNavigate();
  const toast = useToast();
  const { flow, addCreatedProduct, createdCount } = useAuctionFlow();
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isLimitCompleted = createdCount >= flow.productLimit;
  const nextProductNumber = Math.min(createdCount + 1, flow.productLimit);
  const isDataReady = vendors.length > 0 && categories.length > 0;

  useEffect(() => {
    const loadData = async () => {
      const [categoryResult, vendorResult] = await Promise.allSettled([
        api.get("/category?status=ACTIVE"),
        api.get("/vendor").catch(() => api.get("/admin/vendors"))
      ]);

      const nextErrors = [];

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value.data?.data || []);
      } else {
        console.error(categoryResult.reason);
        nextErrors.push("categories");
      }

      if (vendorResult.status === "fulfilled") {
        setVendors(vendorResult.value.data?.data || []);
      } else {
        console.error(vendorResult.reason);
        nextErrors.push("vendors");
      }

      if (nextErrors.length) {
        setFormError(`Unable to load ${nextErrors.join(" and ")}.`);
      }
    };

    loadData();
  }, []);

  const queue = useMemo(() => flow.createdProducts || [], [flow.createdProducts]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({
      ...current,
      image: file
    }));
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const resetProductForm = () => {
    setForm(emptyForm);
    setPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (isLimitCompleted) {
      return;
    }

    if (!isDataReady) {
      setFormError("Wait for vendors and categories to finish loading before adding a product.");
      return;
    }

    if (!form.vendor_id || !form.category_id) {
      setFormError("Please choose both a vendor and a category.");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.stock) <= 0) {
      setFormError("Price and stock must be greater than 0.");
      return;
    }

    if (!form.image) {
      setFormError("Please upload a product image.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const response = await api.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const createdProduct = response.data?.data;
      addCreatedProduct(createdProduct);
      toast.success(`Product ${createdCount + 1} added successfully.`);
      resetProductForm();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Unable to add auction product.";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container">
        <section className="glass-card premium-panel">
          <div className="auction-card-heading">
            <div>
              <div className="premium-badge">Shadow Monarch</div>
              <h1>Add Auction Products</h1>
              <p>
                You set the room limit to {flow.productLimit}. Now add exactly {flow.productLimit} products for this auction room.
              </p>
            </div>
            <span>{createdCount}/{flow.productLimit}</span>
          </div>

          <InlineAlert message={formError} />

          {!isLimitCompleted ? (
            <div className="checkout-layout">
              <section className="glass-card stack-card">
                <h2 className="section-title">Product {nextProductNumber} of {flow.productLimit}</h2>

                <form onSubmit={handleSubmit} className="form">
                  <select name="vendor_id" value={form.vendor_id} onChange={handleChange} required disabled={!vendors.length}>
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.shop_name || vendor.owner_name || vendor.email}
                      </option>
                    ))}
                  </select>

                  <input
                    name="product_name"
                    placeholder="Product Name"
                    value={form.product_name}
                    onChange={handleChange}
                    required
                  />

                  <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />

                  <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
                  <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} required />

                  <select name="category_id" value={form.category_id} onChange={handleChange} required disabled={!categories.length}>
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <input type="file" accept="image/*" onChange={handleFileChange} required />

                  {preview ? <img src={preview} alt="preview" className="preview-img" /> : null}

                  <div className="cta-row">
                    <button type="button" className="btn-secondary-modern" onClick={() => navigate("/admin/auction/limit")}>
                      Back
                    </button>
                    <button type="submit" disabled={loading || !isDataReady} className="btn-modern">
                      {loading ? "Saving..." : `Add Product ${nextProductNumber}`}
                    </button>
                  </div>
                </form>
              </section>

              <section className="glass-card stack-card">
                <div className="auction-card-heading">
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Added Queue</h2>
                  <span>{createdCount} ready</span>
                </div>

                {queue.length ? (
                  <div className="auction-preview-list">
                    {queue.map((product, index) => (
                      <div key={product._id} className="line-item">
                        <div>
                          <div className="line-item-title">{index + 1}. {product.product_name}</div>
                          <div className="line-item-meta">
                            Rs. {Number(product.price || 0).toLocaleString()} | {product.category_id?.name || "Category linked"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">Newly added auction products will appear here.</div>
                )}
              </section>
            </div>
          ) : (
            <section className="glass-card stack-card">
              <div className="success-banner" style={{ marginBottom: "18px" }}>
                All {flow.productLimit} products are added. Add Product form is now locked and Create Room is ready.
              </div>

              <div className="auction-preview-list" style={{ marginBottom: "18px" }}>
                {queue.map((product, index) => (
                  <div key={product._id} className="line-item">
                    <div>
                      <div className="line-item-title">{index + 1}. {product.product_name}</div>
                      <div className="line-item-meta">
                        Rs. {Number(product.price || 0).toLocaleString()} | Stock {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cta-row">
                <button type="button" className="btn-secondary-modern" onClick={() => navigate("/admin/auction/limit")}>
                  Change Limit
                </button>
                <button type="button" className="btn-modern" onClick={() => navigate("/admin/create-auction-room")}>
                  Create Room
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
