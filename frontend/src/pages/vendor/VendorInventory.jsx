import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import InlineAlert from "../../components/ui/InlineAlert";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import { getStoredUser, getStoredVendor } from "../../utils/session";
import {
  filterVendorProducts,
  formatCompactDate,
  getVendorId
} from "../../utils/vendorWorkspace";
import "../../styles/gopal.css";

const emptyForm = {
  product_name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  status: "ACTIVE",
  is_auction_exclusive: "false",
  auction_availability: "AVAILABLE",
  image: null
};

const inventoryScopes = [
  { key: "ALL", label: "All Products" },
  { key: "ACTIVE", label: "Active" },
  { key: "INACTIVE", label: "Inactive" },
  { key: "LOW_STOCK", label: "Low Stock" },
  { key: "AUCTION", label: "Auction Ready" }
];

const resolveImage = (imagePath) =>
  imagePath ? `${api.defaults.baseURL?.replace(/\/api$/, "")}${imagePath}` : "";

export default function VendorInventory() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = useMemo(() => getStoredUser(), []);
  const storedVendor = useMemo(() => getStoredVendor(), []);
  const vendorId = getVendorId(storedVendor, user);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("ALL");
  const [quickUpdatingId, setQuickUpdatingId] = useState("");

  const vendorProducts = useMemo(
    () => filterVendorProducts(products, vendorId),
    [products, vendorId]
  );

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return vendorProducts.filter((product) => {
      const categoryName = product?.category_id?.name || "";
      const matchesKeyword = !keyword
        ? true
        : [product?.product_name, product?.description, categoryName]
            .join(" ")
            .toLowerCase()
            .includes(keyword);

      if (!matchesKeyword) {
        return false;
      }

      if (scope === "ACTIVE") {
        return product?.status !== "INACTIVE";
      }

      if (scope === "INACTIVE") {
        return product?.status === "INACTIVE";
      }

      if (scope === "LOW_STOCK") {
        return Number(product?.stock || 0) < 10;
      }

      if (scope === "AUCTION") {
        return Boolean(product?.is_auction_exclusive);
      }

      return true;
    });
  }, [query, scope, vendorProducts]);

  useEffect(() => {
    const loadInventory = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          api.get("/product"),
          api.get("/category")
        ]);

        setProducts(productRes.data?.data || []);
        setCategories(categoryRes.data?.data || []);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError.response?.data?.message || "Unable to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [vendorId]);

  if (!user || user.role?.toUpperCase() !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setPreview("");
    setError("");
  };

  const reloadProducts = async () => {
    const res = await api.get("/product");
    setProducts(res.data?.data || []);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "is_auction_exclusive" && value !== "true"
        ? { auction_availability: "AVAILABLE" }
        : {})
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, image: file }));
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleEdit = (product) => {
    setEditingId(product?._id || "");
    setForm({
      product_name: product?.product_name || "",
      description: product?.description || "",
      price: product?.price || "",
      stock: product?.stock || "",
      category_id: product?.category_id?._id || product?.category_id || "",
      status: product?.status || "ACTIVE",
      is_auction_exclusive: String(Boolean(product?.is_auction_exclusive)),
      auction_availability: product?.auction_availability || "AVAILABLE",
      image: null
    });
    setPreview(resolveImage(product?.image));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product from your inventory?");
    if (!confirmed) return;

    try {
      await api.delete(`/product/${productId}`);
      toast.success("Product removed from inventory.");
      await reloadProducts();

      if (editingId === productId) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(deleteError);
      toast.error(deleteError.response?.data?.message || "Unable to delete product.");
    }
  };

  const handleQuickUpdate = async (productId, payload, successMessage) => {
    try {
      setQuickUpdatingId(productId);
      await api.put(`/product/${productId}`, payload);
      toast.success(successMessage);
      await reloadProducts();
    } catch (updateError) {
      console.error(updateError);
      toast.error(updateError.response?.data?.message || "Unable to update product.");
    } finally {
      setQuickUpdatingId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.product_name.trim() || !form.category_id) {
      setError("Product name and category are required.");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.stock) < 0) {
      setError("Price must be greater than 0 and stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("vendor_id", vendorId);
      formData.append("product_name", form.product_name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category_id", form.category_id);
      formData.append("status", form.status);
      formData.append("is_auction_exclusive", form.is_auction_exclusive);
      formData.append(
        "auction_availability",
        form.is_auction_exclusive === "true" ? form.auction_availability : "AVAILABLE"
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        await api.put(`/product/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Product updated successfully.");
      } else {
        await api.post("/product", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Product added to inventory.");
      }

      resetForm();
      await reloadProducts();
    } catch (saveError) {
      console.error(saveError);
      const message = saveError.response?.data?.message || "Unable to save product.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered label="Loading vendor inventory..." />;
  }

  const lowStockCount = vendorProducts.filter((product) => Number(product?.stock || 0) < 10).length;
  const activeCount = vendorProducts.filter((product) => product?.status !== "INACTIVE").length;
  const auctionReadyCount = vendorProducts.filter((product) => product?.is_auction_exclusive).length;
  const inactiveCount = vendorProducts.filter((product) => product?.status === "INACTIVE").length;

  return (
    <div className="shop-shell fade-in-page">
      <div className="shop-container vendor-workspace">
        <div className="shop-hero vendor-hero">
          <div>
            <h1>Vendor Inventory</h1>
            <p>Manage your full catalog, switch products between direct sale and auction-ready mode, and keep stock visibility under control.</p>
          </div>

          <div className="dashboard-topbar__actions">
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn-secondary-modern hover-scale" onClick={() => navigate("/vendor/sales-analytics")}>
              Open Analytics
            </button>
            <button className="btn-modern hover-scale" onClick={resetForm}>
              {editingId ? "Add Another Product" : "Reset Form"}
            </button>
          </div>
        </div>

        <div className="summary-grid vendor-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">Total Products</div>
            <div className="summary-value">{vendorProducts.length}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Active Listings</div>
            <div className="summary-value">{activeCount}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Low Stock</div>
            <div className="summary-value">{lowStockCount}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Auction Ready</div>
            <div className="summary-value">{auctionReadyCount}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">Inactive</div>
            <div className="summary-value">{inactiveCount}</div>
          </div>
        </div>

        <div className="checkout-layout vendor-workspace__grid">
          <section className="glass-card stack-card">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">
                  {editingId ? "Update Product" : "Add Product"}
                </h2>
                <p>Vendors can control pricing, stock, visibility, and auction readiness from this form.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="status-panel">
              <InlineAlert message={error} />

              <input
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                placeholder="Product Name"
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the product, fabric, style, and selling angle"
              />

              <div className="vendor-form-grid">
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  min="1"
                  required
                />
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stock"
                  min="0"
                  required
                />
              </div>

              <div className="vendor-form-grid">
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">Choose Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Active Listing</option>
                  <option value="INACTIVE">Inactive Listing</option>
                </select>
              </div>

              <div className="vendor-form-grid">
                <select name="is_auction_exclusive" value={form.is_auction_exclusive} onChange={handleChange}>
                  <option value="false">Direct Sale Product</option>
                  <option value="true">Auction Ready Product</option>
                </select>

                <select
                  name="auction_availability"
                  value={form.auction_availability}
                  onChange={handleChange}
                  disabled={form.is_auction_exclusive !== "true"}
                >
                  <option value="AVAILABLE">Auction Available</option>
                  <option value="RESERVED">Auction Reserved</option>
                  <option value="SOLD">Auction Sold</option>
                </select>
              </div>

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview ? (
                <div className="vendor-preview-card">
                  <img src={preview} alt="Product preview" className="vendor-preview-card__image" />
                  <span>Preview</span>
                </div>
              ) : null}

              <div className="cta-row">
                <button type="submit" className="btn-modern hover-scale" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Product" : "Create Product"}
                </button>

                {editingId ? (
                  <button type="button" className="btn-secondary-modern hover-scale" onClick={resetForm}>
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="glass-card stack-card">
            <div className="vendor-section-head">
              <div>
                <h2 className="section-title">Your Catalog</h2>
                <p>Search, filter, and quickly control everything that belongs to your store.</p>
              </div>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, category, or description"
              />
            </div>

            <div className="vendor-filter-row">
              {inventoryScopes.map((option) => (
                <button
                  key={option.key}
                  className={`vendor-filter-chip ${scope === option.key ? "is-active" : ""}`}
                  onClick={() => setScope(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-state vendor-empty-state">
                No products found for this filter yet.
              </div>
            ) : (
              <div className="vendor-catalog-list">
                {filteredProducts.map((product) => (
                  <article key={product._id} className="vendor-catalog-card">
                    {product.image ? (
                      <img
                        src={resolveImage(product.image)}
                        alt={product.product_name}
                        className="product-image"
                      />
                    ) : null}

                    <div className="vendor-catalog-card__top">
                      <div>
                        <h3>{product.product_name}</h3>
                        <p>{product.category_id?.name || "Uncategorized"}</p>
                      </div>
                      <span className={`status ${product.status || "ACTIVE"}`}>
                        {product.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="vendor-catalog-card__meta">
                      <span>Rs. {Number(product.price || 0).toLocaleString()}</span>
                      <span>Stock {product.stock}</span>
                      <span>Sold {product.sold_count || 0}</span>
                      <span>Views {product.views || 0}</span>
                      <span>Rating {product.rating ? Number(product.rating).toFixed(1) : "-"}</span>
                      <span>Added {formatCompactDate(product.created_at)}</span>
                    </div>

                    <div className="vendor-filter-row vendor-filter-row--compact">
                      <span className={`status ${product?.is_auction_exclusive ? "AVAILABLE" : "PENDING"}`}>
                        {product?.is_auction_exclusive ? "Auction Ready" : "Direct Sale"}
                      </span>
                      {product?.is_auction_exclusive ? (
                        <span className={`status ${product?.auction_availability || "AVAILABLE"}`}>
                          {product?.auction_availability || "AVAILABLE"}
                        </span>
                      ) : null}
                    </div>

                    <p className="vendor-catalog-card__description">
                      {product.description || "No description added yet."}
                    </p>

                    <div className="cta-row">
                      <button className="btn-secondary-modern hover-scale" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                      <button className="btn-danger-modern hover-scale" onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </div>

                    <div className="cta-row">
                      <button
                        className="btn-secondary-modern hover-scale"
                        onClick={() =>
                          handleQuickUpdate(
                            product._id,
                            { status: product.status === "INACTIVE" ? "ACTIVE" : "INACTIVE" },
                            product.status === "INACTIVE"
                              ? "Product moved back to active."
                              : "Product marked inactive."
                          )
                        }
                        disabled={quickUpdatingId === product._id}
                      >
                        {product.status === "INACTIVE" ? "Mark Active" : "Mark Inactive"}
                      </button>
                      <button
                        className="btn-secondary-modern hover-scale"
                        onClick={() =>
                          handleQuickUpdate(
                            product._id,
                            {
                              is_auction_exclusive: !product?.is_auction_exclusive,
                              auction_availability: !product?.is_auction_exclusive
                                ? "AVAILABLE"
                                : "AVAILABLE"
                            },
                            !product?.is_auction_exclusive
                              ? "Product is now auction ready."
                              : "Auction mode removed from this product."
                          )
                        }
                        disabled={quickUpdatingId === product._id}
                      >
                        {product?.is_auction_exclusive ? "Remove Auction" : "Enable Auction"}
                      </button>
                      {product?.is_auction_exclusive ? (
                        <select
                          value={product?.auction_availability || "AVAILABLE"}
                          onChange={(event) =>
                            handleQuickUpdate(
                              product._id,
                              {
                                is_auction_exclusive: true,
                                auction_availability: event.target.value
                              },
                              `Auction availability changed to ${event.target.value}.`
                            )
                          }
                          disabled={quickUpdatingId === product._id}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
