import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/axios";
import "../../styles/gopal.css";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    vendor_id: "",
    product_name: "",
    description: "",
    price: "",
    stock: "",
    image: ""
  });

  const loadProducts = useCallback(async () => {
    const res = await axios.get("/product");
    setProducts(res.data.data || []);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await loadProducts();
      } catch (error) {
        console.error(error);
      }
    };

    run();
  }, [loadProducts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(`/product/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post("/product", form);
    }

    setForm({
      vendor_id: "",
      product_name: "",
      description: "",
      price: "",
      stock: "",
      image: ""
    });

    await loadProducts();
  };

  const handleEdit = (product) => {
    setForm({
      vendor_id: product.vendor_id?._id || product.vendor_id || "",
      product_name: product.product_name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      image: product.image || ""
    });
    setEditId(product._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/product/${id}`);
    await loadProducts();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Product Management</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="vendor_id"
          placeholder="Vendor ID"
          value={form.vendor_id}
          onChange={handleChange}
          required
        />

        <input
          name="product_name"
          placeholder="Product Name"
          value={form.product_name}
          onChange={handleChange}
          required
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-primary">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Vendor</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p._id}</td>
              <td>{p.product_name}</td>
              <td>{p.vendor_id?.shop_name || "N/A"}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td>
                <img
                  src={
                    p.image
                      ? `${API_BASE_URL.replace(/\/api$/, "")}${p.image}`
                      : "https://via.placeholder.com/50"
                  }
                  className="product-image"
                  alt={p.product_name}
                />
              </td>
              <td>
                <button
                  className="btn btn-warning"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
