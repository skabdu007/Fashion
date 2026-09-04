import { useEffect, useState } from "react";
import InlineAlert from "../../components/ui/InlineAlert";
import { useToast } from "../../components/ui/ToastProvider";
import api from "../../utils/axios";
import "../../styles/gopal.css";

export default function AddProduct() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    vendor_id: "",
    product_name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/category?status=ACTIVE");
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const loadVendors = async () => {
      try {
        const res = await api.get("/vendor");
        setVendors(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
    loadVendors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({
      ...form,
      image: file
    });

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.vendor_id || !form.category_id) {
      setFormError("Please choose both a vendor and a category.");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.stock) <= 0) {
      setFormError("Price and stock must be greater than 0.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("vendor_id", form.vendor_id);
      formData.append("product_name", form.product_name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category_id", form.category_id);

      if (form.image) {
        formData.append("image", form.image);
      }

      await api.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Product added successfully.");
      setForm({
        vendor_id: "",
        product_name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image: null
      });
      setPreview(null);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Error adding product";
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container fade-in-page">
      <h2 className="form-title">Add Product</h2>
      <p className="line-item-meta" style={{ marginBottom: "16px" }}>
        Create products first. After products are created, use the auction flow to choose product limit, select products,
        create room, host live bidding, and show winners.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <InlineAlert message={formError} />

        <select name="vendor_id" value={form.vendor_id} onChange={handleChange} required>
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.shop_name || v.owner_name || v.email}
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

        <select name="category_id" value={form.category_id} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input type="file" accept="image/*" onChange={handleFileChange} required />

        {preview && <img src={preview} alt="preview" className="preview-img" />}

        <button type="submit" disabled={loading} className="btn-primary hover-scale">
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
